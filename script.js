// ==========================================
// FUNÇÃO UTILITÁRIA DE ANIMAÇÃO
// ==========================================
function triggerAnimation(targetId, classToApply) {
    const el = document.getElementById(targetId);
    el.classList.remove(classToApply);
    void el.offsetWidth; // Força renderização do navegador (restart da animação)
    el.classList.add(classToApply);
    
    // Remove classe depois que a animação (0.3s-0.4s no CSS) terminar
    setTimeout(() => {
        el.classList.remove(classToApply);
    }, 450);
}

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
        super("Cavaleiro", 100, 18); // Aumentei o ataque base
        this.lvl = 1;
        this.xp = 0;
        this.xpToNext = 50;
        this.gold = 0;
        this.potions = 3;
    }

    gainXp(amount) {
        this.xp += amount;
        ui.log(`🌟 Você obteve ${amount} EXP.`);
        if (this.xp >= this.xpToNext) this.levelUp();
        ui.update();
    }

    levelUp() {
        this.lvl++;
        this.xp -= this.xpToNext;
        this.xpToNext = Math.floor(this.xpToNext * 1.6);
        this.maxHp += 20;
        this.hp = this.maxHp; // Cura ao subir de nivel
        this.atk += 6;
        ui.log(`🎊 <b>SUBIU DE NÍVEL!</b> Agora é nível ${this.lvl}!`, 'important');
    }

    usePotion() {
        if (this.potions > 0) {
            if (this.hp === this.maxHp) return ui.log("Vida já está cheia.");
            this.potions--;
            const healAmount = 50;
            this.hp = Math.min(this.hp + healAmount, this.maxHp);
            ui.log(`🧪 Usou poção. Recuperou ${healAmount} Vida.`);
            ui.update();
            
            // Se estiver em combate, perde o turno ao usar poção
            if (game.state === 'combat') {
                combat.enemyTurn();
            }
        } else {
            ui.log("❌ Sem poções!");
        }
    }

    buyPotion() {
        if (this.gold >= 20) {
            this.gold -= 20;
            this.potions++;
            ui.log("🛒 Comprou 1 poção rúnica.");
            ui.update();
        } else {
            ui.log("❌ Ouro insuficiente.");
        }
    }
}

class Enemy extends Character {
    constructor(name, hp, atk, xpReward, goldReward, icon) {
        super(name, hp, atk);
        this.xpReward = xpReward;
        this.goldReward = goldReward;
        this.icon = icon; // Emoji/Ícone do inimigo
    }
}

const player = new Player();

// Banco de Dados de Inimigos
const enemiesDB = [
    { name: "Goblin Saqueador", hp: 35, atk: 7, xp: 20, gold: 10, icon: "👺" },
    { name: "Lobo Das Neves", hp: 50, atk: 10, xp: 35, gold: 15, icon: "🐺" },
    { name: "Orc Enfurecido", hp: 90, atk: 15, xp: 60, gold: 30, icon: "👹" },
    { name: "Esqueleto Guerreiro", hp: 45, atk: 13, xp: 40, gold: 5, icon: "💀" }
];

// ==========================================
// CENTRAL DE COMBATE (Corrigido)
// ==========================================
const combat = {
    activeEnemy: null, // Onde o inimigo atual é guardado (CORREÇÃO)

    start(enemyData) {
        game.state = 'combat';
        
        // Cria nova instância do inimigo baseada no banco de dados (CORREÇÃO)
        this.activeEnemy = new Enemy(
            enemyData.name, 
            enemyData.hp, 
            enemyData.atk, 
            enemyData.xp, 
            enemyData.gold, 
            enemyData.icon
        );
        
        ui.log(`⚠️ <b>${this.activeEnemy.name}</b> (${this.activeEnemy.icon}) apareceu!`);
        ui.toggleCombatMode(true);
        ui.update();
    },

    attack() {
        if (!this.activeEnemy) return; // Segurança

        // --- TURNO DO JOGADOR ---
        // Animação de ataque do jogador
        triggerAnimation('player-portrait', 'anim-player-attack');

        // Cálculo de dano (Ataque base + variação aleatória de 0 a 8)
        const dmg = player.atk + Math.floor(Math.random() * 9);
        this.activeEnemy.hp -= dmg;
        
        ui.log(`⚔️ Você desferiu golpe de <b>${dmg}</b> dano.`);
        
        // Inimigo treme ao receber dano
        triggerAnimation('enemy-portrait', 'anim-dmg-shake');
        
        ui.update();

        // Checa se inimigo morreu
        if (this.activeEnemy.isDead()) {
            this.win();
        } else {
            // Se inimigo não morreu, ele contra-ataca depois de um tempo
            document.getElementById('combat-actions').style.opacity = "0.5"; // Desativa botões visualmente
            document.getElementById('combat-actions').style.pointerEvents = "none";
            
            setTimeout(() => this.enemyTurn(), 800); // Atraso dramático
        }
    },

    enemyTurn() {
        if (this.activeEnemy.isDead()) return; // Previne ataque se ele ja morreu

        // --- TURNO DO INIMIGO ---
        // Animação de ataque do inimigo
        triggerAnimation('enemy-portrait', 'anim-enemy-attack');

        // Cálculo de dano do inimigo
        const enemyDmg = this.activeEnemy.atk + Math.floor(Math.random() * 5);
        player.hp -= enemyDmg;
        
        ui.log(`🩸 <b>${this.activeEnemy.name}</b> causou ${enemyDmg} dano em você.`, 'danger');
        
        // Jogador treme ao receber dano
        triggerAnimation('player-portrait', 'anim-dmg-shake');
        
        // Reativa botões de controle
        document.getElementById('combat-actions').style.opacity = "1";
        document.getElementById('combat-actions').style.pointerEvents = "auto";
        
        ui.update();

        // Checa se jogador morreu
        if (player.isDead()) {
            this.lose();
        }
    },

    flee() {
        // 50% de chance de fugir
        if (Math.random() > 0.5) {
            ui.log("🏃 Você fugiu desesperadamente!");
            this.endCombat();
        } else {
            ui.log("🏃 Tentou fugir, mas o monstro bloqueou a passagem!");
            this.enemyTurn();
        }
    },

    win() {
        ui.log(`🏆 <b>${this.activeEnemy.name}</b> foi derrotado!`, 'important');
        player.gold += this.activeEnemy.goldReward;
        player.gainXp(this.activeEnemy.xpReward);
        ui.log(`💰 Saqueou ${this.activeEnemy.goldReward} ouro.`);
        this.endCombat();
    },

    lose() {
        ui.log(`💀 <b>A MORTE TE ALCANÇOU...</b> O Reino chora sua perda.`, 'danger');
        ui.log(`O jogo reiniciará em breve.`, 'important');
        document.getElementById('combat-actions').classList.add('hidden');
        
        // Reinicia o jogo após 4 segundos
        setTimeout(() => location.reload(), 4000);
    },

    endCombat() {
        game.state = 'explore';
        this.activeEnemy = null; // Limpa inimigo ativo (CORREÇÃO)
        ui.toggleCombatMode(false);
        ui.update();
    }
};

// ==========================================
// INTERFACE DE USUÁRIO (UI)
// ==========================================
const ui = {
    logEl: document.getElementById('game-log'),

    log(msg, styleClass = '') {
        const entry = document.createElement('li');
        entry.innerHTML = `> ${msg}`;
        if (styleClass) entry.classList.add(styleClass);
        this.logEl.prepend(entry);
    },

    update() {
        // Atualiza status do jogador
        document.getElementById('hp').innerText = player.hp;
        document.getElementById('max-hp').innerText = player.maxHp;
        document.getElementById('lvl').innerText = player.lvl;
        document.getElementById('gold').innerText = player.gold;
        document.getElementById('potions').innerText = player.potions;

        // Atualiza barras visuais
        const hpPercent = (player.hp / player.maxHp) * 100;
        document.getElementById('hp-bar').style.width = `${hpPercent}%`;
        
        const xpPercent = (player.xp / player.xpToNext) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;

        // Se estiver em combate, atualiza HUD do inimigo (CORREÇÃO: acessando combat.activeEnemy)
        if (combat.activeEnemy) {
            document.getElementById('enemy-name-display').innerText = combat.activeEnemy.name;
            document.getElementById('enemy-art-icon').innerText = combat.activeEnemy.icon;
            
            const enemyHpPercent = Math.max(0, (combat.activeEnemy.hp / combat.activeEnemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
        }
    },

    toggleCombatMode(active) {
        document.getElementById('exploration-actions').classList.toggle('hidden', active);
        document.getElementById('combat-actions').classList.toggle('hidden', !active);
        document.getElementById('battle-arena').classList.toggle('hidden', !active);
    }
};

// ==========================================
// MOTOR DE EVENTOS GERAIS (Exploração)
// ==========================================
const game = {
    state: 'explore',

    explore() {
        // 60% de chance de encontro de batalha
        if (Math.random() > 0.4) {
            this.startCombatEncounter();
        } else {
            // Evento pacífico: achou ouro
            const foundGold = Math.floor(Math.random() * 10) + 2;
            player.gold += foundGold;
            ui.log(`🌲 Explorando floresta... Achou um baú velho com ${foundGold} moedas💰.`, 'important');
            ui.update();
        }
    },

    startCombatEncounter() {
        // Sorteia inimigo do DB
        const enemyTemplate = enemiesDB[Math.floor(Math.random() * enemiesDB.length)];
        combat.start(enemyTemplate); // Passa os dados para o motor de combate (CORREÇÃO)
    },

    rest() {
        if (player.gold >= 10) {
            if (player.hp === player.maxHp) return ui.log("Você já está descansado.");
            player.gold -= 10;
            player.hp = player.maxHp;
            ui.log(`🛌 Dormiu na pousada (+10💰). Vida totalmente restaurada!`, 'important');
            ui.update();
        } else {
            ui.log("❌ Ouro insuficiente para a pousada.");
        }
    }
};

// Inicialização
ui.update();
