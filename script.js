window.player = {
    classObj: null, lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, baseAtk: 0, baseDef: 0, atk: 0, def: 0,
    highestBossDefeated: 0,
    inventory: [],
    equipped: { weapon: null, armor: null, offhand: null },

    recalculateStats() {
        let bonusAtk = (this.equipped.weapon ? this.equipped.weapon.stat : 0) + 
                       (this.equipped.offhand && this.equipped.offhand.adds === 'atk' ? this.equipped.offhand.stat : 0);
        let bonusDef = (this.equipped.armor ? this.equipped.armor.stat : 0) + 
                       (this.equipped.offhand && this.equipped.offhand.adds === 'def' ? this.equipped.offhand.stat : 0);
        this.atk = this.baseAtk + bonusAtk;
        this.def = this.baseDef + bonusDef;
        window.ui.update();
    },

    equip(index) {
        let item = this.inventory[index];
        if (this.equipped[item.type]) this.inventory.push(this.equipped[item.type]);
        this.equipped[item.type] = item;
        this.inventory.splice(index, 1);
        this.recalculateStats();
        window.ui.updateInventoryModal();
        window.game.saveGame();
    },

    unequip(slot) {
        if (this.equipped[slot]) {
            this.inventory.push(this.equipped[slot]);
            this.equipped[slot] = null;
            this.recalculateStats();
            window.ui.updateInventoryModal();
            window.game.saveGame();
        }
    },

    heal(v) { this.hp = Math.min(this.hp + v, this.maxHp); window.ui.update(); },
    usePotion() {
        if (this.potions <= 0) return window.ui.log("Sem poções!");
        this.potions--; this.heal(50); this.mp = Math.min(this.mp + 25, this.maxMp);
        window.ui.log("🧪 Poção: +50 HP, +25 MP");
        if (window.combat.enemy) setTimeout(() => window.combat.enemyTurn(), 800);
        window.ui.updateInventoryModal();
    },
    
    buyPotion() {
        if (this.gold >= 20) { this.gold -= 20; this.potions++; window.ui.log("🛒 Poção comprada."); window.ui.update(); }
    },

    gainXp(v) {
        this.xp += v;
        if (this.xp >= this.xpToNext && this.lvl < 50) {
            this.lvl++; this.xp -= this.xpToNext; this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 20; this.hp = this.maxHp; this.baseAtk += 5; this.maxMp += 10; this.mp = this.maxMp;
            window.ui.log(`🎊 Nível ${this.lvl}!`); this.recalculateStats();
        }
    }
};

window.game = {
    state: 'menu',
    saveGame() {
        if (this.state === 'menu') return;
        localStorage.setItem('aethelgard_save', JSON.stringify(window.player));
        window.ui.log("💾 Jogo Guardado.");
    },
    loadGame() {
        const data = localStorage.getItem('aethelgard_save');
        if (data) {
            Object.assign(window.player, JSON.parse(data));
            this.state = 'explore';
            document.getElementById('class-selection-screen').classList.add('hidden');
            document.getElementById('main-game-screen').classList.remove('hidden');
            window.ui.log("📂 Progresso Carregado.");
            window.player.recalculateStats();
            return true;
        }
        return false;
    },
    resetGame() { if(confirm("Apagar tudo?")) { localStorage.clear(); location.reload(); } },

    chooseClass(key) {
        const cls = {
            cavaleiro: {atk:10, def:5, hp:120, mp:20, icon:'🛡️', skill:'Golpe Duplo'},
            mago: {atk:6, def:1, hp:70, mp:60, icon:'🧙‍♂️', skill:'Fogo'},
            arqueiro: {atk:14, def:3, hp:90, mp:30, icon:'🏹', skill:'Tiro'},
            anao: {atk:8, def:8, hp:150, mp:15, icon:'🪓', skill:'Fúria'}
        }[key];
        window.player.classObj = { name: key, ...cls };
        window.player.maxHp = cls.hp; window.player.hp = cls.hp;
        window.player.maxMp = cls.mp; window.player.mp = cls.mp;
        window.player.baseAtk = cls.atk; window.player.baseDef = cls.def;
        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('main-game-screen').classList.remove('hidden');
        this.state = 'explore'; window.player.recalculateStats();
    },

    explore() {
        let currentBoss = Math.floor(window.player.lvl / 10) * 10;
        if (currentBoss > 0 && window.player.highestBossDefeated < currentBoss) {
            return window.combat.start({name:"BOSS "+currentBoss, baseHp:currentBoss*20, baseAtk:currentBoss*2, icon:'💀', baseXp:currentBoss*10, baseGold:currentBoss*5}, true, currentBoss);
        }
        const r = Math.random();
        if (r < 0.5) window.combat.start([{name:"Goblin", baseHp:30, baseAtk:5, icon:'👺', baseXp:20, baseGold:10}, {name:"Orc", baseHp:60, baseAtk:12, icon:'👹', baseXp:50, baseGold:20}][Math.floor(Math.random()*2)]);
        else if (r < 0.8) {
            const gold = 5 + Math.floor(Math.random()*15); window.player.gold += gold;
            window.ui.log(`🌲 Achaste ${gold} moedas.`); window.ui.update();
        } else {
            const item = [
                {name:"Espada Longa", type:'weapon', stat:10}, 
                {name:"Armadura Placas", type:'armor', stat:12},
                {name:"Escudo de Aço", type:'offhand', adds:'def', stat:8},
                {name:"Grimório", type:'offhand', adds:'atk', stat:6}
            ][Math.floor(Math.random()*4)];
            window.player.inventory.push(item);
            window.ui.log(`🎁 Encontraste: ${item.name}!`);
        }
    },
    rest() { if(window.player.gold >= 10) { window.player.gold -= 10; window.player.hp = window.player.maxHp; window.player.mp = window.player.maxMp; window.ui.log("🛌 Descansaste."); window.ui.update(); } }
};

window.combat = {
    enemy: null,
    start(e, isBoss=false, bLvl=0) {
        this.enemy = {...e, hp: e.baseHp, maxHp: e.baseHp}; this.isBoss = isBoss; this.bossLvl = bLvl;
        window.ui.log(`⚠️ ${e.name} apareceu!`); window.ui.toggleMode(true); window.ui.update();
    },
    attack() {
        const d = window.player.atk + Math.floor(Math.random()*5); this.enemy.hp -= d;
        window.ui.log(`⚔️ Causaste ${d} dano.`); window.ui.animate('player-portrait', 'anim-attack');
        if(this.enemy.hp <= 0) this.win(); else setTimeout(() => this.enemyTurn(), 800);
    },
    enemyTurn() {
        const d = Math.max(1, this.enemy.baseAtk - window.player.def); window.player.hp -= d;
        window.ui.log(`🩸 Sofreste ${d} dano.`); window.ui.update();
        if(window.player.hp <= 0) { alert("Morreste!"); location.reload(); }
    },
    win() {
        window.ui.log(`🏆 Vitória! +${this.enemy.baseGold}💰`);
        window.player.gold += this.enemy.baseGold; window.player.gainXp(this.enemy.baseXp);
        if(this.isBoss) window.player.highestBossDefeated = this.bossLvl;
        this.enemy = null; window.ui.toggleMode(false); window.game.saveGame();
    },
    toggleMode(b) { document.getElementById('exploration-actions').classList.toggle('hidden', b); document.getElementById('combat-actions').classList.toggle('hidden', !b); document.getElementById('battle-arena').classList.toggle('hidden', !b); }
};

window.ui = {
    log(m) { const l = document.getElementById('game-log'); const i = document.createElement('li'); i.innerHTML = "> " + m; l.appendChild(i); document.getElementById('log-window').scrollTop = l.scrollHeight; },
    update() {
        const p = window.player; if(!p.classObj) return;
        document.getElementById('hp').innerText = p.hp; document.getElementById('hp-bar').style.width = (p.hp/p.maxHp)*100 + "%";
        document.getElementById('mp').innerText = p.mp; document.getElementById('mp-bar').style.width = (p.mp/p.maxMp)*100 + "%";
        document.getElementById('gold').innerText = p.gold; document.getElementById('potions').innerText = p.potions;
        document.getElementById('lvl').innerText = p.lvl; document.getElementById('xp-bar').style.width = (p.xp/p.xpToNext)*100 + "%";
        document.getElementById('atk-val').innerText = p.atk; document.getElementById('def-val').innerText = p.def;
        if(window.combat.enemy) {
            document.getElementById('enemy-name-display').innerText = window.combat.enemy.name;
            document.getElementById('enemy-hp-bar').style.width = (window.combat.enemy.hp/window.combat.enemy.maxHp)*100 + "%";
        }
    },
    updateInventoryModal() {
        const inv = window.player.inventory; const eq = window.player.equipped;
        let h = "";
        ['weapon', 'armor', 'offhand'].forEach(s => {
            if(eq[s]) h += `<li class="inv-item">${eq[s].name} <button class="inv-btn" onclick="window.player.unequip('${s}')">Tirar</button></li>`;
            else h += `<li class="inv-item">${s}: Vazio</li>`;
        });
        document.getElementById('inv-equipped').innerHTML = h;
        document.getElementById('inv-bag').innerHTML = inv.map((it, i) => `<li class="inv-item">${it.name} <button class="inv-btn" onclick="window.player.equip(${i})">Usar</button></li>`).join('');
    },
    openInventory() { document.getElementById('inventory-modal').classList.remove('hidden'); this.updateInventoryModal(); },
    closeInventory() { document.getElementById('inventory-modal').classList.add('hidden'); },
    animate(id, cls) { const e = document.getElementById(id); e.classList.add(cls); setTimeout(() => e.classList.remove(cls), 300); }
};

window.onload = () => window.game.loadGame();
