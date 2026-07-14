"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const room_entity_1 = require("../database/entities/room.entity");
const player_entity_1 = require("../database/entities/player.entity");
let GameService = class GameService {
    constructor(roomRepo, playerRepo) {
        this.roomRepo = roomRepo;
        this.playerRepo = playerRepo;
        this.MOCK_MITIGATIONS = [
            { id: 'm1', description: 'Ter um representante da equipe no local do cliente.' },
            { id: 'm2', description: 'Envolva a equipe de testes no projeto desde o início.' },
            { id: 'm3', description: 'Realizar workshops de levantamento com stakeholders.' },
            { id: 'm4', description: 'Estimativa detalhada de custo e cronograma.' }
        ];
        this.MOCK_RISK_CARDS = [
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
        this.MOCK_MITIGATION_CARDS = [
            { id: 'mc1', category: '1. Tarefa', mitigations: [this.MOCK_MITIGATIONS[0], this.MOCK_MITIGATIONS[1], this.MOCK_MITIGATIONS[2]] },
            { id: 'mc2', category: '2. Estrutura', mitigations: [this.MOCK_MITIGATIONS[3]] },
            { id: 'mc3', category: '3. Ator', mitigations: [{ id: 'm5', description: 'Plano de retenção e reconhecimento' }] },
            { id: 'mc4', category: '4. Tecnologia', mitigations: [{ id: 'm6', description: 'Automatizar pipelines' }] },
            { id: 'mc5', category: '1. Tarefa', mitigations: [this.MOCK_MITIGATIONS[2]] }
        ];
    }
    async createRoom() {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = this.roomRepo.create({
            id: roomId,
            status: 'waiting',
            currentRound: 0,
            currentPlayerIndex: 0
        });
        await this.roomRepo.save(room);
        return roomId;
    }
    async getRoom(roomId) {
        return this.roomRepo.findOne({ where: { id: roomId } });
    }
    async joinRoom(roomId, player) {
        const room = await this.roomRepo.findOne({ where: { id: roomId } });
        if (!room)
            throw new Error('Sala não encontrada');
        if (room.status !== 'waiting')
            throw new Error('Jogo já começou');
        if (room.players.length >= 5)
            throw new Error('Sala cheia');
        let existing = await this.playerRepo.findOne({ where: { room: { id: roomId }, nickname: player.nickname } });
        if (existing) {
            existing.id = player.id;
            await this.playerRepo.save(existing);
        }
        else {
            const newPlayer = this.playerRepo.create({
                id: player.id,
                nickname: player.nickname,
                money: 0,
                riskCards: [],
                mitigationCards: [],
                isCreator: player.isCreator,
                room
            });
            await this.playerRepo.save(newPlayer);
        }
        return (await this.roomRepo.findOne({ where: { id: roomId } }));
    }
    async leaveRoom(roomId, playerId) {
        await this.playerRepo.delete({ id: playerId });
        const room = await this.roomRepo.findOne({ where: { id: roomId } });
        if (room && room.players.length === 0) {
            await this.roomRepo.delete(roomId);
        }
    }
    async startGame(roomId) {
        const room = await this.roomRepo.findOne({ where: { id: roomId } });
        if (!room)
            throw new Error('Sala não encontrada');
        if (room.players.length < 2)
            throw new Error('Mínimo 2 jogadores');
        room.status = 'playing';
        room.currentRound = 1;
        room.currentPlayerIndex = 0;
        for (const p of room.players) {
            p.money = 30;
            p.riskCards = this.getRandomCards(this.MOCK_RISK_CARDS, 3);
            p.mitigationCards = this.getRandomCards(this.MOCK_MITIGATION_CARDS, 2);
            await this.playerRepo.save(p);
        }
        await this.roomRepo.save(room);
        return (await this.roomRepo.findOne({ where: { id: roomId } }));
    }
    async attack(roomId, attackerId, targetId, riskCardId) {
        const room = await this.roomRepo.findOne({ where: { id: roomId } });
        if (!room)
            throw new Error('Sala não encontrada');
        if (room.status !== 'playing')
            throw new Error('Jogo não está em andamento');
        const attacker = room.players.find(p => p.id === attackerId);
        const riskCardIndex = attacker?.riskCards.findIndex((c) => c.id === riskCardId);
        if (!attacker || riskCardIndex === undefined || riskCardIndex === -1) {
            throw new Error('Carta ou atacante inválido');
        }
        const riskCard = attacker.riskCards.splice(riskCardIndex, 1)[0];
        await this.playerRepo.save(attacker);
        room.currentAttack = {
            attackerId,
            targetId,
            riskCard
        };
        await this.roomRepo.save(room);
        return (await this.roomRepo.findOne({ where: { id: roomId } }));
    }
    async defend(roomId, targetId, success, mitigationCardId) {
        const room = await this.roomRepo.findOne({ where: { id: roomId } });
        if (!room || !room.currentAttack || room.currentAttack.targetId !== targetId) {
            throw new Error('Nenhum ataque contra este jogador');
        }
        const target = room.players.find(p => p.id === targetId);
        const attacker = room.players.find(p => p.id === room.currentAttack.attackerId);
        if (!target || !attacker)
            throw new Error('Jogadores inválidos');
        let actualSuccess = false;
        if (mitigationCardId) {
            const mcIndex = target.mitigationCards.findIndex((c) => c.id === mitigationCardId);
            if (mcIndex !== -1) {
                const mc = target.mitigationCards[mcIndex];
                if (mc.category === room.currentAttack.riskCard.category) {
                    target.mitigationCards.splice(mcIndex, 1);
                    actualSuccess = true;
                }
            }
        }
        if (actualSuccess) {
            attacker.money -= 5;
            target.money += 5;
        }
        else {
            target.money -= 5;
            attacker.money += 5;
        }
        room.currentAttack = null;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        if (room.currentPlayerIndex === 0) {
            room.currentRound++;
            if (room.currentRound > 4) {
                room.status = 'finished';
            }
            else {
                for (const p of room.players) {
                    p.riskCards.push(...this.getRandomCards(this.MOCK_RISK_CARDS, 1));
                }
            }
        }
        await this.playerRepo.save([target, attacker, ...room.players.filter(p => p.id !== target.id && p.id !== attacker.id)]);
        await this.roomRepo.save(room);
        return (await this.roomRepo.findOne({ where: { id: roomId } }));
    }
    getRandomCards(deck, amount) {
        const shuffled = [...deck].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, amount);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.RoomEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(player_entity_1.PlayerEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GameService);
//# sourceMappingURL=game.service.js.map