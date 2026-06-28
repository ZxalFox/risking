"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
let GameService = class GameService {
    rooms = new Map();
    MOCK_MITIGATIONS = [
        { id: 'm1', description: 'Ter um representante da equipe no local do cliente.' },
        { id: 'm2', description: 'Envolva a equipe de testes no projeto desde o início.' },
        { id: 'm3', description: 'Realizar workshops de levantamento com stakeholders.' },
        { id: 'm4', description: 'Estimativa detalhada de custo e cronograma.' }
    ];
    MOCK_RISK_CARDS = [
        {
            id: 'r1',
            category: '1. Tarefa',
            description: 'Indisponibilidade de documentos de requisitos para testes',
            mitigations: [this.MOCK_MITIGATIONS[0], this.MOCK_MITIGATIONS[1]]
        },
        {
            id: 'r2',
            category: '1. Tarefa',
            description: 'Requisitos ambíguos ou conflitantes',
            mitigations: [this.MOCK_MITIGATIONS[2]]
        },
        {
            id: 'r3',
            category: '2. Estrutura',
            description: 'Horários e cronogramas irreais',
            mitigations: [this.MOCK_MITIGATIONS[3]]
        },
        {
            id: 'r4',
            category: '3. Ator',
            description: 'Alta rotatividade na equipe',
            mitigations: [{ id: 'm5', description: 'Plano de retenção e reconhecimento' }]
        },
        {
            id: 'r5',
            category: '4. Tecnologia',
            description: 'Ferramentas de build instáveis',
            mitigations: [{ id: 'm6', description: 'Automatizar pipelines' }]
        }
    ];
    MOCK_MITIGATION_CARDS = [
        { id: 'mc1', category: '1. Tarefa', mitigations: [this.MOCK_MITIGATIONS[0], this.MOCK_MITIGATIONS[1], this.MOCK_MITIGATIONS[2]] },
        { id: 'mc2', category: '2. Estrutura', mitigations: [this.MOCK_MITIGATIONS[3]] },
        { id: 'mc3', category: '3. Ator', mitigations: [{ id: 'm5', description: 'Plano de retenção e reconhecimento' }] },
        { id: 'mc4', category: '4. Tecnologia', mitigations: [{ id: 'm6', description: 'Automatizar pipelines' }] },
        { id: 'mc5', category: '1. Tarefa', mitigations: [this.MOCK_MITIGATIONS[2]] }
    ];
    createRoom() {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.rooms.set(roomId, {
            id: roomId,
            players: [],
            status: 'waiting',
            currentRound: 0,
            currentPlayerIndex: 0
        });
        return roomId;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    joinRoom(roomId, player) {
        const room = this.rooms.get(roomId);
        if (!room)
            throw new Error('Sala não encontrada');
        if (room.status !== 'waiting')
            throw new Error('Jogo já começou');
        if (room.players.length >= 5)
            throw new Error('Sala cheia');
        const existing = room.players.find(p => p.nickname === player.nickname);
        if (existing) {
            existing.id = player.id;
        }
        else {
            room.players.push({
                ...player,
                money: 0,
                riskCards: [],
                mitigationCards: []
            });
        }
        return room;
    }
    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.players = room.players.filter(p => p.id !== playerId);
            if (room.players.length === 0) {
                this.rooms.delete(roomId);
            }
        }
    }
    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            throw new Error('Sala não encontrada');
        if (room.players.length < 2)
            throw new Error('Mínimo 2 jogadores');
        room.status = 'playing';
        room.currentRound = 1;
        room.currentPlayerIndex = 0;
        room.players.forEach(p => {
            p.money = 30;
            p.riskCards = this.getRandomCards(this.MOCK_RISK_CARDS, 3);
            p.mitigationCards = this.getRandomCards(this.MOCK_MITIGATION_CARDS, 2);
        });
        return room;
    }
    attack(roomId, attackerId, targetId, riskCardId) {
        const room = this.rooms.get(roomId);
        if (!room)
            throw new Error('Sala não encontrada');
        if (room.status !== 'playing')
            throw new Error('Jogo não está em andamento');
        const attacker = room.players.find(p => p.id === attackerId);
        const riskCardIndex = attacker?.riskCards.findIndex(c => c.id === riskCardId);
        if (!attacker || riskCardIndex === undefined || riskCardIndex === -1) {
            throw new Error('Carta ou atacante inválido');
        }
        const riskCard = attacker.riskCards.splice(riskCardIndex, 1)[0];
        room.currentAttack = {
            attackerId,
            targetId,
            riskCard
        };
        return room;
    }
    defend(roomId, targetId, success, mitigationCardId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.currentAttack || room.currentAttack.targetId !== targetId) {
            throw new Error('Nenhum ataque contra este jogador');
        }
        const target = room.players.find(p => p.id === targetId);
        const attacker = room.players.find(p => p.id === room.currentAttack.attackerId);
        if (!target || !attacker)
            throw new Error('Jogadores inválidos');
        if (mitigationCardId) {
            const mcIndex = target.mitigationCards.findIndex(c => c.id === mitigationCardId);
            if (mcIndex !== -1) {
                const mc = target.mitigationCards[mcIndex];
                if (mc.category === room.currentAttack.riskCard.category) {
                    target.mitigationCards.splice(mcIndex, 1);
                    success = true;
                }
                else {
                    success = false;
                }
            }
        }
        if (success) {
            attacker.money -= 5;
            target.money += 5;
        }
        else {
            target.money -= 5;
            attacker.money += 5;
        }
        delete room.currentAttack;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        if (room.currentPlayerIndex === 0) {
            room.currentRound++;
            if (room.currentRound > 4) {
                room.status = 'finished';
            }
            else {
                room.players.forEach(p => {
                    p.riskCards.push(...this.getRandomCards(this.MOCK_RISK_CARDS, 1));
                });
            }
        }
        return room;
    }
    getRandomCards(deck, amount) {
        const shuffled = [...deck].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, amount);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map