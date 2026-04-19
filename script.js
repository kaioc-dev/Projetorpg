// ==========================================
// ESTADO GLOBAL DO JOGADOR
// ==========================================
const player = {
    hp: 100,
    maxHp: 100,
    atk: 15,
    lvl: 1,
    xp: 0,
    xpToNext: 50,
    gold: 0,
    potions: 3,

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    },

    usePotion() {
        if (this.potions <= 0) return ui.log("❌ Você não tem poções!", "dmg-taken");
        if (this.hp === this.maxHp) return ui.log("Sua vida já está cheia.");
        
        this.potions--;
        this.heal(40);
        ui.log(`🧪 Bebeu poção e recuperou 40 de Vida.`, "loot");
        ui.update();

        // Passa o turno se estiver em combate
        if (game.state === 'combat') {
            setTimeout(() => combat.enemyTurn(), 800);
        }
    },

    buyPotion() {
        if (this.gold >= 20) {
            this.gold -= 20;
            this.potions++;
            ui.log("🛒 Comprou 1 Poção Curativa.", "loot");
            ui.update();
        } else {
            ui.log("❌ Ouro insuficiente.");
        }
    },

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.lvl++;
            this.xp -= this.xpToNext;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 20;
            this.hp = this.maxHp;
            this.atk += 5;
            ui.log(`🎊 NÍVEL UP! Você agora é nível ${this.lvl}!`, "loot");
        }
    }
};

// ==========================================
// BANCO DE MONSTROS
// ==========================================
const bestiary = [
    { name: "Goblin Rastejante", maxHp: 30, atk: 5, xp: 25, gold: 10, icon: "👺" },
    { name: "Lobo Faminto", maxHp: 45, atk: 8, xp: 40, gold: 15, icon: "🐺" },
    { name: "Orc Saqueador", maxHp: 80, atk: 12, xp: 70, gold: 35, icon: "👹" },
    { name: "Esqueleto Amaldiçoado", maxHp: 50, atk: 10, xp: 50, gold: 5, icon: "💀" }
];

// ==========================================
// MOTOR DE COMBATE (CORRIGIDO)
// ==========================================
const combat = {
    enemy: null,

    start(enemyData) {
        game.state = 'combat';
        // Cria uma cópia fresca do inimigo para não alterar o bestiário
        this.enemy = { 
            name: enemyData.name, 
            hp: enemyData.maxHp, 
            maxHp: enemyData.maxHp, 
            atk: enemyData.atk, 
            xp: enemyData.xp, 
            gold: enemyData.gold, 
            icon: enemyData.icon 
        };
        
        ui.log(`⚠️ UM <b>${this.enemy.name}</b> SURGIU!`, "dmg-taken");
        ui.toggleMode(true);
        ui.update();
    },

    attack() {
        // Validação de segurança: se não houver inimigo, não faz nada
        if (!this.enemy || this.enemy.hp <= 0) return;

        // Animação Jogador
        ui.animate('player-portrait', 'anim-attack');

        // Dano do Jogador (Ataque base + rolagem de 0 a 5)
        const damage = player.atk + Math.floor(Math.random() * 6);
        this.enemy.hp -= damage;
        
        ui.log(`⚔️ Você cortou o monstro causando <b>${damage}</b> de dano!`, "dmg-dealt");
        ui.animate('enemy-portrait', 'anim-shake');
        ui.update();

        // Desativa botões para evitar clique duplo
        document.getElementById('combat-actions').style.pointerEvents = 'none';

        if (this.enemy.hp <= 0) {
            setTimeout(() => this.win(), 600);
        } else {
            setTimeout(() => this.enemyTurn(), 800);
        }
    },

    enemyTurn() {
        if (!this.enemy || player.hp <= 0) return;

        ui.animate('enemy-portrait', 'anim-attack');

        const enemyDamage = this.enemy.atk + Math.floor(Math.random() * 4);
        player.hp -= enemyDamage;
        
        ui.log(`🩸 O monstro atacou! Você sofreu <b>${enemyDamage}</b> de dano.`, "dmg-taken");
        ui.animate('player-portrait', 'anim-shake');
        ui.update();

        // Reativa botões
        document.getElementById('combat-actions').style.pointerEvents = 'auto';

        if (player.hp <= 0) {
            this.lose();
        }
    },

    flee() {
        if (Math.random() > 0.5) {
            ui.log("🏃 Você fugiu para a escuridão da floresta.");
            this.end();
        } else {
            ui.log("🏃 O monstro bloqueou seu caminho!", "dmg-taken");
            // Desativa botões temporariamente enquanto o monstro ataca
            document.getElementById('combat-actions').style.pointerEvents = 'none';
            setTimeout(() => this.enemyTurn(), 800);
        }
    },

    win() {
        ui.log(`🏆 <b>Vitória!</b> O ${this.enemy.name} caiu.`, "loot");
        ui.log(`💰 Coletou ${this.enemy.gold} ouro e ${this.enemy.xp} EXP.`, "loot");
        
        player.gold += this.enemy.gold;
        player.gainXp(this.enemy.xp);
        
        this.end();
    },

    lose() {
        ui.log(`💀 <b>VOCÊ MORREU.</b> A escuridão o consome.`, "dmg-taken");
        document.getElementById('combat-actions').style.display = 'none';
        setTimeout(() => location.reload(), 4000);
    },

    end() {
        game.state = 'explore';
        this.enemy = null;
        document.getElementById('combat-actions').style.pointerEvents = 'auto'; // Segurança
        ui.toggleMode(false);
        ui.update();
    }
};

// ==========================================
// REGRAS DE EXPLORAÇÃO
// ==========================================
const game = {
    state: 'explore',

    explore() {
        if (Math.random() > 0.4) {
            const randomEnemy = bestiary[Math.floor(Math.random() * bestiary.length)];
            combat.start(randomEnemy);
        } else {
            const foundGold = Math.floor(Math.random() * 15) + 5;
            player.gold += foundGold;
            ui.log(`🌲 Encontrou um viajante morto. Saqueou ${foundGold} ouro.`, "loot");
            ui.update();
        }
    },

    rest() {
        if (player.gold >= 10) {
            if (player.hp === player.maxHp) return ui.log("Sua saúde já está perfeita.");
            player.gold -= 10;
            player.hp = player.maxHp;
            ui.log(`🛌 Descansou na pousada. Saúde restaurada!`, "loot");
            ui.update();
        } else {
            ui.log("❌ O estalajadeiro o expulsou. Faltam moedas.");
        }
    }
};

// ==========================================
// GERENCIADOR VISUAL (UI)
// ==========================================
const ui = {
    log(message, className = "") {
        const ul = document.getElementById('game-log');
        const li = document.createElement('li');
        li.innerHTML = `> ${message}`;
        if (className) li.className = className;
        ul.prepend(li);
    },

    update() {
        // Status Herói
        document.getElementById('hp').innerText = Math.max(0, player.hp);
        document.getElementById('max-hp').innerText = player.maxHp;
        document.getElementById('lvl').innerText = player.lvl;
        document.getElementById('gold').innerText = player.gold;
        document.getElementById('potions').innerText = player.potions;

        // Barras Herói
        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hp-bar').style.width = `${hpPct}%`;
        const xpPct = Math.min(100, (player.xp / player.xpToNext) * 100);
        document.getElementById('xp-bar').style.width = `${xpPct}%`;

        // HUD Combate
        if (combat.enemy) {
            document.getElementById('enemy-name-display').innerText = combat.enemy.name;
            document.getElementById('enemy-art-icon').innerText = combat.enemy.icon;
            
            const enemyHpPct = Math.max(0, (combat.enemy.hp / combat.enemy.maxHp) * 100);
            document.getElementById('enemy-hp-bar').style.width = `${enemyHpPct}%`;
        }
    },

    toggleMode(isCombat) {
        document.getElementById('exploration-actions').classList.toggle('hidden', isCombat);
        document.getElementById('combat-actions').classList.toggle('hidden', !isCombat);
        document.getElementById('battle-arena').classList.toggle('hidden', !isCombat);
    },

    animate(elementId, animationClass) {
        const el = document.getElementById(elementId);
        if(!el) return;
        el.classList.remove(animationClass);
        void el.offsetWidth; // Força re-render
        el.classList.add(animationClass);
        setTimeout(() => el.classList.remove(animationClass), 350);
    }
};

// Renderização inicial
ui.update();
