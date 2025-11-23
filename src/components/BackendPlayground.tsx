"use client";

import { FormEvent, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type ActionKey =
  | "register"
  | "login"
  | "refresh"
  | "listActive"
  | "create"
  | "join"
  | "start"
  | "state"
  | "leave";

type ApiResult = {
  action: ActionKey;
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
  timestamp: string;
};

type BackendPlaygroundProps = {
  initialBaseUrl?: string;
  initialLocale: string;
};

type ActiveSessionPreview = {
  id: string;
  status?: string;
  playerCount: number;
};

const FALLBACK_BASE_URL = "http://localhost:4000";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isAuthTokens(data: unknown): data is {
  accessToken: string;
  refreshToken: string;
} {
  if (!data || typeof data !== "object") {
    return false;
  }

  const tokenData = data as Record<string, unknown>;
  return (
    typeof tokenData.accessToken === "string" &&
    typeof tokenData.refreshToken === "string"
  );
}

function extractSessionId(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const wrapper = data as Record<string, unknown>;
  const session = wrapper.session as Record<string, unknown> | undefined;
  const maybeId = session?.id;
  return typeof maybeId === "string" ? maybeId : null;
}

function extractActiveSessions(data: unknown): ActiveSessionPreview[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const wrapper = entry as Record<string, unknown>;
    const session = wrapper.session as Record<string, unknown> | undefined;
    const players = wrapper.players;
    const id = session?.id;

    if (typeof id !== "string") {
      return [];
    }

    const status =
      typeof session?.status === "string"
        ? (session.status as string)
        : undefined;
    const playerCount = Array.isArray(players) ? players.length : 0;

    return [{ id, status, playerCount } satisfies ActiveSessionPreview];
  });
}

function formatTimestamp(timestamp: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(timestamp));
  } catch (error) {
    void error;
    return timestamp;
  }
}

export default function BackendPlayground({
  initialBaseUrl,
  initialLocale,
}: BackendPlaygroundProps) {
  const locale = useLocale();
  const t = useTranslations("PlaygroundPage");

  const defaultBaseUrl = useMemo(() => {
    if (initialBaseUrl && initialBaseUrl.trim().length > 0) {
      return trimTrailingSlash(initialBaseUrl.trim());
    }
    return FALLBACK_BASE_URL;
  }, [initialBaseUrl]);

  const [baseUrl, setBaseUrl] = useState<string>(defaultBaseUrl);
  const [email, setEmail] = useState<string>(
    () => `tester+${Date.now()}@example.com`
  );
  const [password, setPassword] = useState<string>("ChangeMe123!");
  const [displayName, setDisplayName] = useState<string>("Test User");
  const [registrationLocale, setRegistrationLocale] = useState<string>(
    initialLocale || locale
  );
  const [accessToken, setAccessToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<string>("3");
  const [roundCount, setRoundCount] = useState<string>("4");
  const [lastResult, setLastResult] = useState<ApiResult | null>(null);
  const [loadingAction, setLoadingAction] = useState<ActionKey | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionPreview[]>(
    []
  );

  function logError(action: ActionKey, message: string) {
    const result: ApiResult = {
      action,
      ok: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
    setLastResult(result);
  }

  async function callApi(
    action: ActionKey,
    path: string,
    init: RequestInit = {},
    options: {
      auth?: boolean;
      onSuccess?(data: unknown): void;
    } = {}
  ) {
    const trimmedBase = baseUrl.trim();
    if (!trimmedBase) {
      logError(action, t("errors.missingBaseUrl"));
      return;
    }

    if (options.auth && !accessToken) {
      logError(action, t("errors.missingAccessToken"));
      return;
    }

    const url = `${trimTrailingSlash(trimmedBase)}/${path}`;
    setLoadingAction(action);

    try {
      const headers = new Headers(init.headers ?? {});
      const hasBody = Boolean(init.body);

      if (options.auth && accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      if (hasBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(url, {
        ...init,
        headers,
        cache: "no-store",
      });

      const text = await response.text();
      let data: unknown = null;
      if (text.length > 0) {
        try {
          data = JSON.parse(text);
        } catch (error) {
          void error;
          data = text;
        }
      }

      const result: ApiResult = {
        action,
        ok: response.ok,
        status: response.status,
        data,
        error:
          response.ok || typeof data !== "string"
            ? undefined
            : (data as string),
        timestamp: new Date().toISOString(),
      };

      setLastResult(result);

      if (response.ok) {
        options.onSuccess?.(data);
      }

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("errors.unexpected");
      logError(action, message);
      return;
    } finally {
      setLoadingAction(null);
    }
  }

  function handleGenerateEmail() {
    setEmail(`tester+${Date.now()}@example.com`);
  }

  function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void callApi(
      "register",
      "auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          displayName,
          locale: registrationLocale || undefined,
        }),
      },
      {
        onSuccess: (data) => {
          if (isAuthTokens(data)) {
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
          }
        },
      }
    );
  }

  function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void callApi(
      "login",
      "auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      {
        onSuccess: (data) => {
          if (isAuthTokens(data)) {
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
          }
        },
      }
    );
  }

  function onRefresh(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!refreshToken) {
      logError("refresh", t("errors.missingRefreshToken"));
      return;
    }

    void callApi(
      "refresh",
      "auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      },
      {
        onSuccess: (data) => {
          if (isAuthTokens(data)) {
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
          }
        },
      }
    );
  }

  function listActiveSessions() {
    void callApi(
      "listActive",
      "sessions/active",
      {},
      {
        onSuccess: (data) => {
          setActiveSessions(extractActiveSessions(data));
        },
      }
    );
  }

  function onCreateSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: Record<string, unknown> = {};
    if (maxPlayers.trim().length > 0) {
      payload.maxPlayers = Number.parseInt(maxPlayers, 10);
    }
    if (roundCount.trim().length > 0) {
      payload.roundCount = Number.parseInt(roundCount, 10);
    }
    if (registrationLocale.trim().length > 0) {
      payload.locale = registrationLocale.trim();
    }

    void callApi(
      "create",
      "sessions",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      {
        auth: true,
        onSuccess: (data) => {
          const id = extractSessionId(data);
          if (id) {
            setSessionId(id);
          }
        },
      }
    );
  }

  function ensureSessionId(action: ActionKey) {
    const trimmed = sessionId.trim();
    if (!trimmed) {
      logError(action, t("errors.missingSessionId"));
      return null;
    }
    return trimmed;
  }

  function onJoinSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = ensureSessionId("join");
    if (!id) {
      return;
    }

    void callApi(
      "join",
      `sessions/${id}/join`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
      {
        auth: true,
        onSuccess: () => {
          setSessionId(id);
        },
      }
    );
  }

  function onStartSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = ensureSessionId("start");
    if (!id) {
      return;
    }

    void callApi(
      "start",
      `sessions/${id}/start`,
      {
        method: "POST",
      },
      { auth: true }
    );
  }

  function onFetchState(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = ensureSessionId("state");
    if (!id) {
      return;
    }

    void callApi(
      "state",
      `sessions/${id}/state`,
      {},
      {
        auth: true,
        onSuccess: (data) => {
          const latestId = extractSessionId(data);
          if (latestId) {
            setSessionId(latestId);
          }
        },
      }
    );
  }

  function onLeaveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = ensureSessionId("leave");
    if (!id) {
      return;
    }

    void callApi(
      "leave",
      `sessions/${id}/leave`,
      {
        method: "POST",
      },
      { auth: true }
    );
  }

  function handleClearTokens() {
    setAccessToken("");
    setRefreshToken("");
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-heading text-2xl text-neutral-900">
          {t("heading")}
        </h2>
        <p>{t("intro")}</p>
        <div className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2 sm:p-6">
          <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
            {t("baseUrlLabel")}
            <input
              type="url"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="http://localhost:4000"
            />
          </label>
          <div className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
            <span>{t("helpers.generateEmailLabel")}</span>
            <button
              type="button"
              onClick={handleGenerateEmail}
              className="rounded-lg bg-amber-500 px-3 py-2 text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {t("helpers.generateEmail")}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <header className="space-y-2">
          <h3 className="font-heading text-xl text-neutral-900">
            {t("authSection.heading")}
          </h3>
          <p className="text-sm text-neutral-600">
            {t("authSection.description")}
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          <form
            className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            onSubmit={onRegister}
          >
            <h4 className="font-heading text-lg text-neutral-900">
              {t("authSection.registerHeading")}
            </h4>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {t("fields.email")}
              <input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {t("fields.password")}
              <input
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {t("fields.displayName")}
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {t("fields.locale")}
              <input
                type="text"
                value={registrationLocale}
                onChange={(event) => setRegistrationLocale(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder={locale}
              />
            </label>
            <button
              type="submit"
              disabled={loadingAction === "register"}
              className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {loadingAction === "register"
                ? t("status.loading", { action: t("actions.register") })
                : t("actions.register")}
            </button>
          </form>

          <form
            className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            onSubmit={onLogin}
          >
            <h4 className="font-heading text-lg text-neutral-900">
              {t("authSection.loginHeading")}
            </h4>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {t("fields.email")}
              <input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {t("fields.password")}
              <input
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                required
              />
            </label>
            <button
              type="submit"
              disabled={loadingAction === "login"}
              className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {loadingAction === "login"
                ? t("status.loading", { action: t("actions.login") })
                : t("actions.login")}
            </button>
          </form>

          <form
            className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            onSubmit={onRefresh}
          >
            <h4 className="font-heading text-lg text-neutral-900">
              {t("authSection.refreshHeading")}
            </h4>
            <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
              {t("refreshTokenLabel")}
              <textarea
                value={refreshToken}
                onChange={(event) => setRefreshToken(event.target.value)}
                className="h-24 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </label>
            <button
              type="submit"
              disabled={loadingAction === "refresh"}
              className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
            >
              {loadingAction === "refresh"
                ? t("status.loading", { action: t("actions.refresh") })
                : t("actions.refresh")}
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <header className="space-y-2">
          <h3 className="font-heading text-xl text-neutral-900">
            {t("sessionsSection.heading")}
          </h3>
          <p className="text-sm text-neutral-600">
            {t("sessionsSection.description")}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <form
              className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              onSubmit={onCreateSession}
            >
              <h4 className="font-heading text-lg text-neutral-900">
                {t("sessionsSection.createHeading")}
              </h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
                  {t("fields.maxPlayers")}
                  <input
                    type="number"
                    min={3}
                    max={5}
                    value={maxPlayers}
                    onChange={(event) => setMaxPlayers(event.target.value)}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
                  {t("fields.roundCount")}
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={roundCount}
                    onChange={(event) => setRoundCount(event.target.value)}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
                  {t("fields.locale")}
                  <input
                    type="text"
                    value={registrationLocale}
                    onChange={(event) =>
                      setRegistrationLocale(event.target.value)
                    }
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loadingAction === "create"}
                className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {loadingAction === "create"
                  ? t("status.loading", { action: t("actions.create") })
                  : t("actions.create")}
              </button>
            </form>

            <form
              className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              onSubmit={onJoinSession}
            >
              <h4 className="font-heading text-lg text-neutral-900">
                {t("sessionsSection.joinHeading")}
              </h4>
              <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
                {t("fields.sessionId")}
                <input
                  type="text"
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                  className="rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="00000000-0000-0000-0000-000000000000"
                />
              </label>
              <button
                type="submit"
                disabled={loadingAction === "join"}
                className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {loadingAction === "join"
                  ? t("status.loading", { action: t("actions.join") })
                  : t("actions.join")}
              </button>
            </form>

            <form
              className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              onSubmit={onStartSession}
            >
              <h4 className="font-heading text-lg text-neutral-900">
                {t("sessionsSection.startHeading")}
              </h4>
              <p className="text-sm text-neutral-600">
                {t("sessionsSection.startHint")}
              </p>
              <button
                type="submit"
                disabled={loadingAction === "start"}
                className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {loadingAction === "start"
                  ? t("status.loading", { action: t("actions.start") })
                  : t("actions.start")}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-heading text-lg text-neutral-900">
                  {t("activeSessions.heading")}
                </h4>
                <button
                  type="button"
                  onClick={listActiveSessions}
                  disabled={loadingAction === "listActive"}
                  className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-400"
                >
                  {loadingAction === "listActive"
                    ? t("status.loading", { action: t("actions.listActive") })
                    : t("actions.listActive")}
                </button>
              </div>
              {activeSessions.length === 0 ? (
                <p className="text-sm text-neutral-600">
                  {t("activeSessions.empty")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {activeSessions.map((session) => (
                    <li
                      key={session.id}
                      className="rounded-lg border border-neutral-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-mono text-xs text-neutral-600">
                            {session.id}
                          </p>
                          <p className="text-sm text-neutral-700">
                            {t("activeSessions.players", {
                              count: session.playerCount,
                            })}
                          </p>
                          {session.status ? (
                            <p className="text-xs uppercase tracking-wide text-neutral-500">
                              {session.status}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSessionId(session.id)}
                          className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        >
                          {t("activeSessions.use")}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              onSubmit={onFetchState}
            >
              <h4 className="font-heading text-lg text-neutral-900">
                {t("sessionsSection.stateHeading")}
              </h4>
              <button
                type="submit"
                disabled={loadingAction === "state"}
                className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {loadingAction === "state"
                  ? t("status.loading", { action: t("actions.state") })
                  : t("actions.state")}
              </button>
            </form>

            <form
              className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              onSubmit={onLeaveSession}
            >
              <h4 className="font-heading text-lg text-neutral-900">
                {t("sessionsSection.leaveHeading")}
              </h4>
              <button
                type="submit"
                disabled={loadingAction === "leave"}
                className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-white shadow transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {loadingAction === "leave"
                  ? t("status.loading", { action: t("actions.leave") })
                  : t("actions.leave")}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <header className="space-y-1">
          <h3 className="font-heading text-xl text-neutral-900">
            {t("tokens.heading")}
          </h3>
          <p className="text-sm text-neutral-600">{t("tokens.description")}</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
            {t("accessTokenLabel")}
            <textarea
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              className="h-32 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
            {t("refreshTokenLabel")}
            <textarea
              value={refreshToken}
              onChange={(event) => setRefreshToken(event.target.value)}
              className="h-32 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleClearTokens}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
        >
          {t("clearTokens")}
        </button>
      </section>

      <section className="space-y-3">
        <header className="space-y-1">
          <h3 className="font-heading text-xl text-neutral-900">
            {t("latestResult.heading")}
          </h3>
          <p className="text-sm text-neutral-600">
            {t("latestResult.subheading")}
          </p>
        </header>
        {lastResult ? (
          <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
                  {t(`actions.${lastResult.action}`)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatTimestamp(lastResult.timestamp)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  lastResult.ok
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white"
                }`}
              >
                {lastResult.ok ? t("status.success") : t("status.error")}
                {typeof lastResult.status === "number"
                  ? ` · ${lastResult.status}`
                  : ""}
              </span>
            </div>
            {lastResult.error ? (
              <p className="text-sm text-rose-600">{lastResult.error}</p>
            ) : null}
            <pre className="max-h-96 overflow-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
              {JSON.stringify(lastResult.data, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">{t("latestResult.empty")}</p>
        )}
      </section>
    </div>
  );
}
