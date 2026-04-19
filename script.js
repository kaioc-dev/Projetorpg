// ==========================================
// ESTADO GLOBAL DO JOGADOR
// ==========================================
const player = {
    hp: 100, maxHp: 100, atk: 15, lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3,

    heal(amount) { this.hp = Math.min(this.hp + amount, this.maxHp); ui.update(); },
    
    usePotion() {
        if (this.potions <= 0) return ui.log("❌ Você não tem poções!", "dmg-taken");
        if (this.hp === this.maxHp) return ui.log("Sua vida já está cheia.");
        this.potions--; this.heal(40);
        ui.log(`🧪 Bebeu poção e recuperou 40 de Vida.`, "loot");
        if (game.state === 'combat') setTimeout(() => combat.enemyTurn(), 800);
    },

    buyPotion() {
        if (this.gold >= 20) { this.gold -= 20; this.potions++; ui.log("🛒 Comprou 1 Poção Curativa.", "loot"); ui.update(); } 
        else { ui.log("❌ Ouro insuficiente."); }
    },

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.lvl++; this.xp -= this.xpToNext; this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 20; this.hp = this.maxHp; this.atk += 5;
            ui.log(`🎊 NÍVEL UP! Você agora é nível ${this.lvl}! Ficou mais forte.`, "loot");
        }
    }
};

// ==========================================
// BANCO DE MONSTROS E NPCS
// ==========================================
const bestiary = [
    { name: "Goblin Rastejante", baseHp: 30, baseAtk: 5, baseXp: 25, baseGold: 10, icon: "👺" },
    { name: "Lobo Faminto", baseHp: 45, baseAtk: 8, baseXp: 40, baseGold: 15, icon: "🐺" },
    { name: "Orc Saqueador", baseHp: 80, baseAtk: 12, baseXp: 70, baseGold: 35, icon: "👹" },
    { name: "Esqueleto Amaldiçoado", baseHp: 50, baseAtk: 10, baseXp: 50, baseGold: 5, icon: "💀" }
];

const npcs = [
    { name: "Curandeira Cega", encounter: () => { player.heal(50); ui.log("🧙‍♀️ 'Deixe-me tocar suas feridas'. Você recuperou 50 de HP.", "npc"); } },
    { name: "Cavaleiro Ferido", encounter: () => { const g = 15; player.gold += g; ui.log(`🏇 'Tome meu ouro, não precisarei mais dele...' (+${g}💰)`, "npc"); ui.update(); } },
    { name: "Mendigo Sábio", encounter: () => { player.gainXp(30); ui.log("🧙‍♂️ Ele murmura segredos antigos em seu ouvido. (+30 EXP)", "npc"); ui.update(); } },
    { name: "Ladrão Ágil", encounter: () => { if(player.gold > 5) { player.gold -= 5; ui.log("🥷 Um vulto passa rápido por você. Suas moedas estão mais leves! (-5💰)", "dmg-taken"); } else { ui.log("🥷 Um vulto o revista, mas desiste por você estar pobre.", "npc"); } ui.update(); } }
];

// ==========================================
// MOTOR DE COMBATE
// ==========================================
const combat = {
    enemy: null,

    start(enemyData) {
        game.state = 'combat';
        
        // Dificuldade acompanha o nível do jogador
        const difficultyScale = 1 + ((player.lvl - 1) * 0.20); 
        
        this.enemy = { 
            name: enemyData.name, 
            hp: Math.floor(enemyData.baseHp * difficultyScale), 
            maxHp: Math.floor(enemyData.baseHp * difficultyScale), 
            atk: Math.floor(enemyData.baseAtk * difficultyScale), 
            xp: Math.floor(enemyData.baseXp * difficultyScale), 
            gold: Math.floor(enemyData.baseGold * difficultyScale), 
            icon: enemyData.icon,
            lvl: player.lvl
        };
        
        ui.log(`⚠️ Um <b>${this.enemy.name} (Nível ${this.enemy.lvl})</b> bloqueia o caminho!`, "dmg-taken");
        ui.toggleMode(true); ui.update();
    },

    attack() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        ui.animate('player-portrait', 'anim-attack');

        const damage = player.atk + Math.floor(Math.random() * 6);
        this.enemy.hp -= damage;
        ui.log(`⚔️ Você atacou causando <b>${damage}</b> de dano!`, "dmg-dealt");
        ui.animate('enemy-portrait', 'anim-shake'); ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'none';

        if (this.enemy.hp <= 0) setTimeout(() => this.win(), 600);
        else setTimeout(() => this.enemyTurn(), 800);
    },

    enemyTurn() {
        if (!this.enemy || player.hp <= 0) return;
        ui.animate('enemy-portrait', 'anim-attack');

        const enemyDamage = this.enemy.atk + Math.floor(Math.random() * 4);
        player.hp -= enemyDamage;
        ui.log(`🩸 O monstro atacou! Sofreu <b>${enemyDamage}</b> de dano.`, "dmg-taken");
        ui.animate('player-portrait', 'anim-shake'); ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'auto';

        if (player.hp <= 0) this.lose();
    },

    flee() {
        if (Math.random() > 0.5) { ui.log("🏃 Você escapou com vida."); this.end(); } 
        else { ui.log("🏃 O monstro bloqueou seu caminho!", "dmg-taken"); document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
    },

    win() {
        ui.log(`🏆 <b>Vitória!</b> Coletou ${this.enemy.gold}💰 e ${this.enemy.xp} EXP.`, "loot");
        player.gold += this.enemy.gold; player.gainXp(this.enemy.xp); this.end();
    },

    lose() {
        ui.log(`💀 <b>VOCÊ MORREU.</b> A lenda chega ao fim.`, "dmg-taken");
        document.getElementById('combat-actions').style.display = 'none';
        setTimeout(() => location.reload(), 4000);
    },

    end() { game.state = 'explore'; this.enemy = null; document.getElementById('combat-actions').style.pointerEvents = 'auto'; ui.toggleMode(false); ui.update(); }
};

// ==========================================
// EVENTOS DO JOGO
// ==========================================
const game = {
    state: 'explore',

    explore() {
        const roll = Math.random();
        if (roll < 0.50) {
            const randomEnemy = bestiary[Math.floor(Math.random() * bestiary.length)];
            combat.start(randomEnemy);
        } else if (roll < 0.75) {
            const foundGold = Math.floor(Math.random() * 15) + 5;
            player.gold += foundGold;
            ui.log(`🌲 Achou um baú esquecido com ${foundGold}💰.`, "loot");
            ui.update();
        } else {
            const npc = npcs[Math.floor(Math.random() * npcs.length)];
            ui.log(`⛺ Você encontra <b>${npc.name}</b> pelo caminho.`, "npc");
            npc.encounter();
        }
    },

    rest() {
        if (player.gold >= 10) {
            if (player.hp === player.maxHp) return ui.log("Sua saúde já está perfeita.");
            player.gold -= 10; player.hp = player.maxHp;
            ui.log(`🛌 Descansou na pousada (+HP Máx).`, "loot"); ui.update();
        } else { ui.log("❌ O estalajadeiro quer 10 moedas. Volte quando tiver."); }
    }
};

// ==========================================
// GERENCIADOR VISUAL (UI) COM AUTO-SCROLL CORRIGIDO
// ==========================================
const ui = {
    log(message, className = "") {
        const container = document.getElementById('log-window');
        const ul = document.getElementById('game-log');
        const li = document.createElement('li');
        
        li.innerHTML = `> ${message}`;
        if (className) li.className = className;
        
        ul.appendChild(li);
        
        // CORREÇÃO: O setTimeout dá tempo ao navegador para renderizar o novo "li" 
        // antes de tentar calcular o tamanho total (scrollHeight) da janela.
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 10); 
    },

    update() {
        document.getElementById('hp').innerText = Math.max(0, player.hp);
        document.getElementById('max-hp').innerText = player.maxHp;
        document.getElementById('lvl').innerText = player.lvl;
        document.getElementById('gold').innerText = player.gold;
        document.getElementById('potions').innerText = player.potions;

        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hp-bar').style.width = `${hpPct}%`;
        const xpPct = Math.min(100, (player.xp / player.xpToNext) * 100);
        document.getElementById('xp-bar').style.width = `${xpPct}%`;

        if (combat.enemy) {
            document.getElementById('enemy-name-display').innerText = combat.enemy.name;
            document.getElementById('enemy-art-icon').innerText = combat.enemy.icon;
            document.getElementById('enemy-lvl-display').innerText = combat.enemy.lvl;
            
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
        void el.offsetWidth; 
        el.classList.add(animationClass);
        setTimeout(() => el.classList.remove(animationClass), 350);
    }
};

// Inicia o Jogo
ui.update();
