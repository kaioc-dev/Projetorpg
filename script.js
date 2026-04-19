// ==========================================
// CLASSES (Orientação a Objetos)
// ==========================================
class Character {
    constructor(name, hp, atk) {
        this.name = name;
        this.maxHp = hp;
        this.hp = hp;
        this.atk = atk;
    }
    isDead() { return this.hp <= 0; }
}

class Player extends Character {
    constructor() {
        super("Herói", 100, 15);
        this.lvl = 1;
        this.xp = 0;
        this.xpToNext = 50;
        this.gold = 0;
        this.potions = 3;
    }

    gainXp(amount) {
        this.xp += amount;
        ui.log(`🌟 Você ganhou ${amount} de XP.`);
        if (this.xp >= this.xpToNext) this.levelUp();
        ui.update();
    }

    levelUp() {
        this.lvl++;
        this.xp -= this.xpToNext;
        this.xpToNext = Math.floor(this.xpToNext * 1.5); // Escala de XP necessária
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.atk += 5;
        ui.log(`🎉 SUBIU DE NÍVEL! Você agora é nível ${this.lvl}. Atributos aumentados!`);
    }

    usePotion() {
        if (this.potions > 0) {
            if (this.hp === this.maxHp) {
                ui.log("Seu HP já está cheio!");
                return;
            }
            this.potions--;
            const heal = 40;
            this.hp = Math.min(this.hp + heal, this.maxHp);
            ui.log(`Você tomou uma poção e recuperou ${heal} de HP.`);
            
            // Se estiver em combate, usar a poção gasta o turno do jogador
            if (game.state === 'combat') combat.enemyTurn();
            ui.update();
        } else {
            ui.log("Você não tem mais poções!");
        }
    }

    buyPotion() {
        if (this.gold >= 20) {
            this.gold -= 20;
            this.potions++;
            ui.log("Você comprou uma poção da mercadora ambulante.");
            ui.update();
        } else {
            ui.log("Ouro insuficiente para comprar uma poção.");
        }
    }
}

class Enemy extends Character {
    constructor(name, hp, atk, xpReward, goldReward) {
        super(name, hp, atk);
        this.xpReward = xpReward;
        this.goldReward = goldReward;
    }
}

// ==========================================
// BANCO DE DADOS E ESTADO GERAL
// ==========================================
const player = new Player();

// Lista de inimigos possíveis
const enemiesDB = [
    { name: "Goblin Fraco", hp: 30, atk: 6, xp: 20, gold: 10 },
    { name: "Lobo Selvagem", hp: 45, atk: 9, xp: 35, gold: 15 },
    { name: "Orc Furioso", hp: 80, atk: 14, xp: 60, gold: 30 }
];

// ==========================================
// GERENCIADOR DE INTERFACE (UI)
// ==========================================
const ui = {
    logElement: document.getElementById('game-log'),
    
    log(msg) {
        const entry = document.createElement('li');
        entry.innerText = `> ${msg}`;
        this.logElement.prepend(entry);
    },
    
    update() {
        // Atualiza textos
        document.getElementById('hp').innerText = player.hp;
        document.getElementById('max-hp').innerText = player.maxHp;
        document.getElementById('lvl').innerText = player.lvl;
        document.getElementById('gold').innerText = player.gold;
        document.getElementById('potions').innerText = player.potions;
        
        // Atualiza Barra de XP
        const xpPercent = (player.xp / player.xpToNext) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;

        // Atualiza Barra de HP do Inimigo se estiver em combate
        if (combat.currentEnemy) {
            const enemyHpPercent = Math.max(0, (combat.currentEnemy.hp / combat.currentEnemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
            document.getElementById('enemy-name').innerText = combat.currentEnemy.name;
        }
    },
    
    toggleCombatMode(active) {
        document.getElementById('exploration-actions').classList.toggle('hidden', active);
        document.getElementById('combat-actions').classList.toggle('hidden', !active);
        document.getElementById('enemy-panel').classList.toggle('hidden', !active);
    }
};

// ==========================================
// GERENCIADOR DE COMBATE
// ==========================================
const combat = {
    currentEnemy: null,
    
    attack() {
        // Dano base + margem de aleatoriedade
        const dmg = Math.floor(Math.random() * 6) + player.atk;
        this.currentEnemy.hp -= dmg;
        ui.log(`⚔️ Você atacou e causou ${dmg} de dano.`);

        if (this.currentEnemy.isDead()) {
            this.win();
        } else {
            this.enemyTurn();
        }
    },

    enemyTurn() {
        const enemyDmg = Math.floor(Math.random() * 5) + this.currentEnemy.atk;
        player.hp -= enemyDmg;
        ui.log(`🩸 ${this.currentEnemy.name} contra-atacou causando ${enemyDmg} de dano.`);
        ui.update();

        if (player.isDead()) {
            ui.log("💀 VOCÊ MORREU! A escuridão toma conta... (Página recarregará)");
            setTimeout(() => location.reload(), 4000); // Recarrega o jogo após a morte
        }
    },

    flee() {
        const chance = Math.random();
        if (chance > 0.4) { // 60% de chance de fugir
            ui.log("🏃 Você fugiu da batalha com sucesso!");
            game.endCombat();
        } else {
            ui.log("🏃 Você tentou fugir, mas o inimigo bloqueou o caminho!");
            this.enemyTurn();
        }
    },

    win() {
        ui.log(`🏆 Você derrotou o ${this.currentEnemy.name}!`);
        player.gold += this.currentEnemy.goldReward;
        ui.log(`Saqueou ${this.currentEnemy.goldReward} moedas de ouro.`);
        player.gainXp(this.currentEnemy.xpReward);
        game.endCombat();
    }
};

// ==========================================
// MOTOR DE EVENTOS GERAIS
// ==========================================
const game = {
    state: 'explore', // 'explore' ou 'combat'

    explore() {
        const encounterChance = Math.random();
        
        if (encounterChance > 0.5) { // 50% de chance de achar um monstro
            this.startCombat();
        } else {
            const foundGold = Math.floor(Math.random() * 12) + 3;
            player.gold += foundGold;
            ui.log(`🌿 Você explorou uma clareira tranquila e encontrou ${foundGold} moedas perdidas.`);
            ui.update();
        }
    },

    startCombat() {
        this.state = 'combat';
        
        // Seleciona um inimigo aleatório do "banco de dados"
        const enemyTemplate = enemiesDB[Math.floor(Math.random() * enemiesDB.length)];
        
        // Clona o objeto gerando uma Nova Instância para que o inimigo atual não altere a matriz principal
        combat.currentEnemy = new Enemy(enemyTemplate.name, enemyTemplate.hp, enemyTemplate.atk, enemyTemplate.xp, enemyTemplate.gold);
        
        ui.log(`⚠️ UM INIMIGO APARECEU: ${combat.currentEnemy.name}!`);
        ui.toggleCombatMode(true);
        ui.update();
    },

    endCombat() {
        this.state = 'explore';
        combat.currentEnemy = null;
        ui.toggleCombatMode(false);
        ui.update();
    },

    rest() {
        const cost = 10;
        if (player.gold >= cost) {
            if (player.hp === player.maxHp) {
                ui.log("Você já está descansado. Não precisa da pousada agora.");
                return;
            }
            player.gold -= cost;
            player.hp = player.maxHp;
            ui.log(`🛌 Você pagou a pousada e dormiu confortavelmente. HP restaurado!`);
            ui.update();
        } else {
            ui.log("O estalajadeiro diz: 'Sem dinheiro, sem cama!' (Ouro insuficiente)");
        }
    }
};

// Inicia a renderização base
ui.update();
