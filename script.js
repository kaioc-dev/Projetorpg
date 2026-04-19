// Função auxiliar para reiniciar animações CSS
function playAnimation(elementId, animationClass) {
    const el = document.getElementById(elementId);
    el.classList.remove(animationClass);
    void el.offsetWidth; // Força o navegador a recalcular o layout (restart da animação)
    el.classList.add(animationClass);
    
    // Remove a classe após a animação terminar para poder usar de novo
    setTimeout(() => { el.classList.remove(animationClass); }, 400);
}

// ==========================================
// CLASSES DO JOGO
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
        super("Cavaleiro", 100, 15);
        this.lvl = 1;
        this.xp = 0;
        this.xpToNext = 50;
        this.gold = 0;
        this.potions = 3;
    }

    gainXp(amount) {
        this.xp += amount;
        ui.log(`🌟 Ganhou ${amount} de XP.`);
        if (this.xp >= this.xpToNext) this.levelUp();
        ui.update();
    }

    levelUp() {
        this.lvl++;
        this.xp -= this.xpToNext;
        this.xpToNext = Math.floor(this.xpToNext * 1.5);
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.atk += 5;
        ui.log(`🎉 NÍVEL ${this.lvl}! Você se sente mais forte.`);
    }

    usePotion() {
        if (this.potions > 0) {
            if (this.hp === this.maxHp) return ui.log("Vida já está cheia!");
            this.potions--;
            const heal = 40;
            this.hp = Math.min(this.hp + heal, this.maxHp);
            ui.log(`✨ Usou uma poção (+${heal} HP).`);
            
            if (game.state === 'combat') setTimeout(() => combat.enemyTurn(), 800);
            ui.update();
        } else {
            ui.log("❌ Sem poções!");
        }
    }

    buyPotion() {
        if (this.gold >= 20) {
            this.gold -= 20;
            this.potions++;
            ui.log("🛒 Comprou 1 poção.");
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
        this.icon = icon; // A "arte" do inimigo
    }
}

const player = new Player();

// Banco de Inimigos com ícones visuais
const enemiesDB = [
    { name: "Goblin Ladrão", hp: 30, atk: 6, xp: 20, gold: 10, icon: "👺" },
    { name: "Lobo Feroz", hp: 45, atk: 9, xp: 35, gold: 15, icon: "🐺" },
    { name: "Orc Brutal", hp: 80, atk: 14, xp: 60, gold: 30, icon: "👹" },
    { name: "Esqueleto", hp: 40, atk: 12, xp: 40, gold: 5, icon: "💀" }
];

// ==========================================
// INTERFACE (UI)
// ==========================================
const ui = {
    logElement: document.getElementById('game-log'),
    
    log(msg) {
        const entry = document.createElement('li');
        entry.innerHTML = msg; // Permite formatação em HTML no log
        this.logElement.prepend(entry);
    },
    
    update() {
        document.getElementById('hp').innerText = player.hp;
        document.getElementById('max-hp').innerText = player.maxHp;
        document.getElementById('lvl').innerText = player.lvl;
        document.getElementById('gold').innerText = player.gold;
        document.getElementById('potions').innerText = player.potions;
        
        const xpPercent = (player.xp / player.xpToNext) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;

        if (combat.currentEnemy) {
            const enemyHpPercent = Math.max(0, (combat.currentEnemy.hp / combat.currentEnemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
            document.getElementById('enemy-name').innerText = `${combat.currentEnemy.icon} ${combat.currentEnemy.name}`;
        }
    },
    
    toggleCombatMode(active) {
        document.getElementById('exploration-actions').classList.toggle('hidden', active);
        document.getElementById('combat-actions').classList.toggle('hidden', !active);
        document.getElementById('enemy-panel').classList.toggle('hidden', !active);
        document.getElementById('arena').classList.toggle('hidden', !active); // Mostra a arena visual
    }
};

// ==========================================
// COMBATE
// ==========================================
const combat = {
    currentEnemy: null,
    
    attack() {
        // Anima o jogador atacando (Vai para a direita)
        playAnimation('player-portrait', 'anim-attack-right');
        
        setTimeout(() => {
            const dmg = Math.floor(Math.random() * 6) + player.atk;
            this.currentEnemy.hp -= dmg;
            ui.log(`⚔️ Você causou <b>${dmg}</b> de dano!`);
            
            // Anima o inimigo tomando dano (Tremor)
            playAnimation('enemy-portrait', 'anim-damage');
            ui.update();

            if (this.currentEnemy.isDead()) {
                setTimeout(() => this.win(), 500); // Atraso para ver o inimigo morrer
            } else {
                setTimeout(() => this.enemyTurn(), 800); // Inimigo ataca depois de um tempo
            }
        }, 150); // O dano computa na metade da animação do ataque
    },

    enemyTurn() {
        // Anima o inimigo atacando (Vai para a esquerda)
        playAnimation('enemy-portrait', 'anim-attack-left');

        setTimeout(() => {
            const enemyDmg = Math.floor(Math.random() * 5) + this.currentEnemy.atk;
            player.hp -= enemyDmg;
            ui.log(`🩸 O inimigo causou <b>${enemyDmg}</b> de dano em você.`);
            
            // Anima o jogador tomando dano
            playAnimation('player-portrait', 'anim-damage');
            ui.update();

            if (player.isDead()) {
                ui.log("💀 <b>A MORTE TE ALCANÇOU...</b>");
                document.getElementById('combat-actions').classList.add('hidden');
                setTimeout(() => location.reload(), 4000);
            }
        }, 150);
    },

    flee() {
        if (Math.random() > 0.4) {
            ui.log("🏃 Você escapou com vida!");
            game.endCombat();
        } else {
            ui.log("🏃 Falhou em fugir!");
            this.enemyTurn();
        }
    },

    win() {
        ui.log(`🏆 Você venceu!`);
        player.gold += this.currentEnemy.goldReward;
        player.gainXp(this.currentEnemy.xpReward);
        game.endCombat();
    }
};

// ==========================================
// EVENTOS
// ==========================================
const game = {
    state: 'explore',

    explore() {
        if (Math.random() > 0.5) {
            this.startCombat();
        } else {
            const foundGold = Math.floor(Math.random() * 12) + 3;
            player.gold += foundGold;
            ui.log(`🌿 Achou um baú velho contendo ${foundGold} moedas.`);
            ui.update();
        }
    },

    startCombat() {
        this.state = 'combat';
        const template = enemiesDB[Math.floor(Math.random() * enemiesDB.length)];
        this.currentEnemy = new Enemy(template.name, template.hp, template.atk, template.xp, template.gold, template.icon);
        
        // Atualiza a imagem (emoji) do inimigo na arena
        document.getElementById('enemy-art-icon').innerText = this.currentEnemy.icon;
        
        ui.log(`⚠️ <b>${this.currentEnemy.name}</b> bloqueia seu caminho!`);
        ui.toggleCombatMode(true);
        ui.update();
    },

    endCombat() {
        this.state = 'explore';
        this.currentEnemy = null;
        ui.toggleCombatMode(false);
        ui.update();
    },

    rest() {
        if (player.gold >= 10) {
            if (player.hp === player.maxHp) return ui.log("Você já está com a vida cheia.");
            player.gold -= 10;
            player.hp = player.maxHp;
            ui.log(`🛌 Você dormiu na pousada. Vida restaurada!`);
            ui.update();
        } else {
            ui.log("❌ Ouro insuficiente para a pousada.");
        }
    }
};

ui.update();
