// ==========================================
// SISTEMA DE ÁUDIO
// ==========================================
window.audio = {
    muted: false,
    // Links genéricos e seguros (Substitua por caminhos locais como './musica.mp3' se preferir)
    bgm: new Audio('https://freepd.com/music/Epic%20Boss%20Battle.mp3'), 
    clickSfx: new Audio('https://actions.google.com/sounds/v1/weapons/sword_swing.ogg'),
    attackSfx: new Audio('https://actions.google.com/sounds/v1/weapons/battle_axe_swing.ogg'),
    
    init() {
        this.bgm.loop = true;
        this.bgm.volume = 0.4;
        this.clickSfx.volume = 0.8;
        this.attackSfx.volume = 1.0;
    },
    playBGM() { if(!this.muted) this.bgm.play().catch(e => console.log("Áudio bloqueado pelo navegador.")); },
    playClick() { if(!this.muted) { this.clickSfx.currentTime = 0; this.clickSfx.play().catch(e=>{}); } },
    playAttack() { if(!this.muted) { this.attackSfx.currentTime = 0; this.attackSfx.play().catch(e=>{}); } },
    toggleMute() {
        this.muted = !this.muted;
        document.getElementById('btn-sound').innerText = this.muted ? '🔇' : '🔊';
        if(this.muted) this.bgm.pause(); else this.playBGM();
        this.playClick();
    }
};
window.audio.init();

// ==========================================
// SISTEMA DE IDIOMAS (i18n)
// ==========================================
window.lang = 'pt';
const i18n = {
    pt: {
        choose: "Escolha seu destino:", explore: "🌲 Explorar", rest: "🛌 Pousada (10💰)", buy: "🛒 Comprar Poção (20💰)",
        attack: "⚔️ Atacar!", potion: "🧪 Poção", flee: "🏃 Fugir", bag: "🎒 Bolsa",
        gold: "Ouro", potions: "Poções", you: "Você", lvl: "Nvl",
        invTitle: "🎒 Gerenciador de Itens", equipped: "🤺 Equipado", bagItems: "🎒 Sua Mochila",
        saveExit: "💾 Salvar e Sair", exitNoSave: "🚪 Sair sem Salvar", settings: "⚙️ Configurações",
        log_welcome: "Bem-vindo. A aventura começa!", log_rest: "🛌 Descansou. Vida/Mana no máximo!", log_no_gold: "❌ Ouro insuficiente.",
        log_run: "🏃 Escapou com sucesso!", log_norun: "🏃 Fuga bloqueada!"
    },
    en: {
        choose: "Choose your destiny:", explore: "🌲 Explore", rest: "🛌 Inn (10💰)", buy: "🛒 Buy Potion (20💰)",
        attack: "⚔️ Attack!", potion: "🧪 Potion", flee: "🏃 Flee", bag: "🎒 Bag",
        gold: "Gold", potions: "Potions", you: "You", lvl: "Lvl",
        invTitle: "🎒 Item Manager", equipped: "🤺 Equipped", bagItems: "🎒 Your Bag",
        saveExit: "💾 Save & Exit", exitNoSave: "🚪 Exit w/o Saving", settings: "⚙️ Settings",
        log_welcome: "Welcome. The adventure begins!", log_rest: "🛌 Rested. HP/MP restored!", log_no_gold: "❌ Not enough gold.",
        log_run: "🏃 Fled successfully!", log_norun: "🏃 Flee blocked!"
    }
};

window.sys = {
    setLang(l) {
        window.lang = l;
        const d = i18n[l];
        document.getElementById('txt-choose').innerText = d.choose;
        document.getElementById('btn-explore').innerText = d.explore;
        document.getElementById('btn-rest').innerText = d.rest;
        document.getElementById('btn-buy-potion').innerText = d.buy;
        document.getElementById('btn-attack').innerText = d.attack;
        document.getElementById('btn-use-potion').innerText = d.potion;
        document.getElementById('btn-flee').innerText = d.flee;
        document.getElementById('txt-bag').innerText = d.bag;
        document.getElementById('txt-gold').innerText = d.gold;
        document.getElementById('txt-potions').innerText = d.potions;
        document.getElementById('txt-you').innerText = d.you;
        document.getElementById('txt-lvl').innerText = d.lvl;
        document.getElementById('txt-inv-title').innerText = d.invTitle;
        document.getElementById('txt-equipped').innerText = d.equipped;
        document.getElementById('txt-bag-items').innerText = d.bagItems;
        document.getElementById('btn-save-exit').innerText = d.saveExit;
        document.getElementById('btn-exit-nosave').innerText = d.exitNoSave;
        document.getElementById('txt-settings-title').innerText = d.settings;
        window.audio.playClick();
    },
    exitSave() { window.game.saveGame(); location.reload(); },
    exitNoSave() { if(confirm(window.lang==='pt'?"Tem certeza?":"Are you sure?")) location.reload(); }
};

// ==========================================
// DADOS DE JOGO E JOGADOR
// ==========================================
window.classesData = {
    cavaleiro: { name: "Cavaleiro", icon: "🛡️", hp: 120, mp: 20, atk: 10, def: 5, skillName: "Golpe Duplo", skillCost: 10, skillMult: 2.0 },
    mago: { name: "Mago", icon: "🧙‍♂️", hp: 70, mp: 60, atk: 6, def: 1, skillName: "Bola de Fogo", skillCost: 20, skillMult: 3.5 },
    arqueiro: { name: "Arqueiro", icon: "🏹", hp: 90, mp: 30, atk: 14, def: 3, skillName: "Tiro Preciso", skillCost: 15, skillMult: 2.5 },
    anao: { name: "Anão Guerreiro", icon: "🪓", hp: 160, mp: 15, atk: 9, def: 8, skillName: "Fúria", skillCost: 15, skillMult: 1.8 }
};

window.player = {
    classObj: null, lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3, highestBossDefeated: 0,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, baseAtk: 0, baseDef: 0, atk: 0, def: 0, 
    inventory: [], equipped: { weapon: null, armor: null, offhand: null },

    recalculateStats() {
        let offAtk = (this.equipped.offhand && this.equipped.offhand.adds === 'atk') ? this.equipped.offhand.stat : 0;
        let offDef = (this.equipped.offhand && this.equipped.offhand.adds === 'def') ? this.equipped.offhand.stat : 0;
        this.atk = this.baseAtk + (this.equipped.weapon ? this.equipped.weapon.stat : 0) + offAtk;
        this.def = this.baseDef + (this.equipped.armor ? this.equipped.armor.stat : 0) + offDef;
        window.ui.update();
    },

    equip(i) {
        window.audio.playClick();
        let item = this.inventory[i];
        if (this.equipped[item.type]) this.inventory.push(this.equipped[item.type]);
        this.equipped[item.type] = item;
        this.inventory.splice(i, 1);
        this.recalculateStats(); window.ui.updateInventoryModal(); window.game.saveGame(true); // save oculto
    },

    unequip(s) {
        window.audio.playClick();
        if (this.equipped[s]) {
            this.inventory.push(this.equipped[s]);
            this.equipped[s] = null;
            this.recalculateStats(); window.ui.updateInventoryModal(); window.game.saveGame(true);
        }
    },

    heal(v) { this.hp = Math.min(this.hp + v, this.maxHp); window.ui.update(); },
    restoreMp(v) { this.mp = Math.min(this.mp + v, this.maxMp); window.ui.update(); },
    
    usePotion() {
        window.audio.playClick();
        if (this.potions <= 0) return window.ui.log(window.lang==='pt'?"❌ Sem poções!":"❌ No potions!", "dmg-taken");
        if (this.hp === this.maxHp && this.mp === this.maxMp) return;
        this.potions--; this.heal(60); this.restoreMp(40);
        window.ui.log(window.lang==='pt'?`🧪 Bebeu poção.`:`🧪 Drank potion.`, "loot");
        window.ui.updateInventoryModal();
        if (window.game.state === 'combat') { document.getElementById('inventory-modal').classList.add('hidden'); setTimeout(() => window.combat.enemyTurn(), 800); } 
        else window.game.saveGame(true);
    },

    buyPotion() {
        window.audio.playClick();
        if (this.gold >= 20) { this.gold -= 20; this.potions++; window.ui.log("🛒 +1 Poção/Potion.", "loot"); window.ui.update(); window.game.saveGame(true); } 
        else window.ui.log(i18n[window.lang].log_no_gold);
    },

    gainXp(v) {
        if (this.lvl >= 50) return;
        this.xp += v;
        if (this.xp >= this.xpToNext) {
            this.lvl++; this.xp -= this.xpToNext; this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 15; this.hp = this.maxHp; this.maxMp += 5; this.mp = this.maxMp; this.baseAtk += 3; this.baseDef += 1; 
            this.recalculateStats(); window.ui.log(`🎊 NÍVEL UP / LEVEL UP: ${this.lvl}!`, "loot");
        }
    }
};

// ==========================================
// EXPLORAÇÃO
// ==========================================
window.game = {
    state: 'menu',

    saveGame(hidden = false) {
        if (!window.player.classObj) return; 
        localStorage.setItem('aethelgard_save', JSON.stringify(window.player));
        if(!hidden) {
            // Efeito visual no botão em vez de log no diário
            const btn = document.getElementById('btn-save');
            btn.classList.add('save-flash');
            setTimeout(()=> btn.classList.remove('save-flash'), 500);
            window.audio.playClick();
        }
    },

    loadGame() {
        const saved = localStorage.getItem('aethelgard_save');
        if (saved) {
            Object.assign(window.player, JSON.parse(saved));
            document.getElementById('hero-icon').innerText = window.player.classObj.icon;
            document.getElementById('player-art-icon').innerText = window.player.classObj.icon;
            document.getElementById('hero-class-name').innerText = window.player.classObj.name;
            document.getElementById('skill-name').innerText = window.player.classObj.skillName;

            document.getElementById('class-selection-screen').classList.add('hidden');
            document.getElementById('main-game-screen').classList.remove('hidden');
            document.getElementById('top-menu').classList.remove('hidden');
            
            this.state = 'explore'; window.player.recalculateStats();
            return true;
        }
        return false;
    },

    chooseClass(key) {
        window.audio.playClick();
        window.audio.playBGM(); // Inicia música na primeira interação
        const cls = window.classesData[key];
        window.player.classObj = cls;
        window.player.hp = cls.hp; window.player.maxHp = cls.hp; window.player.mp = cls.mp; window.player.maxMp = cls.mp;
        window.player.baseAtk = cls.atk; window.player.baseDef = cls.def;
        
        window.player.recalculateStats();
        
        document.getElementById('hero-icon').innerText = cls.icon;
        document.getElementById('player-art-icon').innerText = cls.icon;
        document.getElementById('hero-class-name').innerText = cls.name;
        document.getElementById('skill-name').innerText = cls.skillName;

        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('main-game-screen').classList.remove('hidden');
        document.getElementById('top-menu').classList.remove('hidden');
        
        this.state = 'explore';
        window.ui.log(i18n[window.lang].log_welcome, "loot");
        this.saveGame(true);
    },

    explore() {
        window.audio.playClick();
        let b = Math.floor(window.player.lvl / 10) * 10;
        if (b >= 10 && window.player.highestBossDefeated < b) {
            window.ui.log(`🌩️ CHEFÃO / BOSS se aproxima!`, "dmg-taken");
            setTimeout(() => { window.combat.start({name: "BOSS Lvl "+b, baseHp: b*18, baseAtk: b*2.5, baseXp: b*30, baseGold: b*10, icon:"👑"}, true, b); }, 1500);
            return;
        }

        const roll = Math.random();
        if (roll < 0.45) window.combat.start([{name: "Goblin", baseHp: 30, baseAtk: 8, baseXp: 25, baseGold: 10, icon: "👺"},{name: "Orc", baseHp: 80, baseAtk: 18, baseXp: 70, baseGold: 35, icon: "👹"}][Math.floor(Math.random()*2)], false);
        else if (roll < 0.70) { 
            const g = Math.floor(Math.random() * 20) + 5; window.player.gold += g;
            window.ui.log(`🌲 Achou/Found ${g}💰.`, "loot"); window.ui.update(); this.saveGame(true);
        } else if (roll < 0.85) { 
            const iRoll = Math.random(); let drop;
            if(iRoll < 0.33) drop = { name: "Espada Épica", type: "weapon", stat: 15 };
            else if(iRoll < 0.66) drop = { name: "Cota de Malha", type: "armor", stat: 10 };
            else drop = { name: "Escudo de Aço", type: "offhand", adds: "def", stat: 8 };
            
            window.player.inventory.push(drop); window.ui.log(`🎁 Item: <b>${drop.name}</b>!`, "skill");
            window.ui.update(); this.saveGame(true);
        } else { 
            window.ui.log(`⛺ Encontrou/Found NPC.`, "sys"); window.player.heal(50); window.ui.update(); this.saveGame(true);
        }
    },

    rest() {
        window.audio.playClick();
        if (window.player.gold >= 10) {
            window.player.gold -= 10; window.player.hp = window.player.maxHp; window.player.mp = window.player.maxMp;
            window.ui.log(i18n[window.lang].log_rest, "loot"); window.ui.update(); this.saveGame(true);
        } else { window.ui.log(i18n[window.lang].log_no_gold); }
    }
};

// ==========================================
// COMBATE
// ==========================================
window.combat = {
    enemy: null, isBossFight: 0, 

    start(e, isBoss = false, bLvl = 0) {
        window.game.state = 'combat'; this.isBossFight = isBoss ? bLvl : 0;
        const scale = 1 + ((window.player.lvl - 1) * 0.20); 
        this.enemy = { name: e.name, hp: Math.floor(e.baseHp * scale), maxHp: Math.floor(e.baseHp * scale), atk: Math.floor(e.baseAtk * scale), xp: Math.floor(e.baseXp * scale), gold: Math.floor(e.baseGold * scale), icon: e.icon, lvl: isBoss ? bLvl : window.player.lvl };
        
        document.getElementById('battle-arena').style.borderColor = isBoss ? "#ff5252" : "#333";
        window.ui.log(`⚠️ <b>${this.enemy.name} (Nvl ${this.enemy.lvl})</b> ataca!`, "dmg-taken");
        window.ui.toggleMode(true); window.ui.update();
    },

    attack() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        window.audio.playAttack();
        window.ui.animate('player-portrait', 'anim-attack');
        const damage = window.player.atk + Math.floor(Math.random() * 8);
        this.processPlayerDamage(damage, `⚔️ Ataque/Attack: <b>${damage}</b>!`);
    },

    useSkill() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        if (window.player.mp < window.player.classObj.skillCost) return window.ui.log("❌ Sem Mana / No Mana", "dmg-taken");
        
        window.player.mp -= window.player.classObj.skillCost; window.ui.update();
        window.audio.playAttack(); window.ui.animate('player-portrait', 'anim-attack');
        
        const damage = Math.floor((window.player.atk * window.player.classObj.skillMult)) + Math.floor(Math.random() * 15);
        this.processPlayerDamage(damage, `✨ <b>${window.player.classObj.skillName}</b>: <b>${damage}</b> dano!`, "skill");
    },

    processPlayerDamage(damage, logMsg) {
        this.enemy.hp -= damage; window.ui.log(logMsg, "dmg-dealt"); window.ui.animate('enemy-portrait', 'anim-shake'); window.ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'none';
        if (this.enemy.hp <= 0) setTimeout(() => this.win(), 800); else setTimeout(() => this.enemyTurn(), 1000);
    },

    enemyTurn() {
        if (!this.enemy || window.player.hp <= 0) return;
        window.ui.animate('enemy-portrait', 'anim-attack');
        const finalDamage = Math.max(1, (this.enemy.atk + Math.floor(Math.random() * 6)) - window.player.def); 
        window.player.hp -= finalDamage;
        window.ui.log(`🩸 Inimigo ataca/Enemy attacks: <b>${finalDamage}</b> (Aparou/Blocked ${window.player.def}🛡️).`, "dmg-taken");
        window.ui.animate('player-portrait', 'anim-shake'); window.ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'auto';
        if (window.player.hp <= 0) this.lose();
    },

    flee() {
        window.audio.playClick();
        if (this.isBossFight) return window.ui.log("❌ Luta de Boss!", "dmg-taken");
        if (Math.random() > 0.4) { window.ui.log(i18n[window.lang].log_run); this.end(); } 
        else { window.ui.log(i18n[window.lang].log_norun, "dmg-taken"); document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
    },

    win() {
        window.ui.log(`🏆 Venceu! +${this.enemy.gold}💰, +${this.enemy.xp} EXP.`, "loot");
        window.player.gold += this.enemy.gold; window.player.gainXp(this.enemy.xp); 
        if (this.isBossFight) {
            window.player.highestBossDefeated = this.isBossFight;
            window.ui.log(`👑 <b>CHEFÃO DERROTADO! / BOSS DEFEATED!</b>`, "skill");
            if (this.isBossFight === 50) { setTimeout(() => { alert("🎉 PARABÉNS! Você zerou o jogo! / You beat the game!"); location.reload(); }, 2000); return; }
        }
        window.game.saveGame(true); this.end();
    },

    lose() {
        window.ui.log(`💀 <b>MORTO / DEAD.</b>`, "dmg-taken"); document.getElementById('combat-actions').style.display = 'none';
        localStorage.removeItem('aethelgard_save'); setTimeout(() => location.reload(), 4000);
    },

    end() { window.game.state = 'explore'; this.enemy = null; this.isBossFight = 0; document.getElementById('combat-actions').style.pointerEvents = 'auto'; document.getElementById('battle-arena').style.borderColor = "#333"; window.ui.toggleMode(false); window.ui.update(); }
};

// ==========================================
// GERENCIADOR UI
// ==========================================
window.ui = {
    log(m, cls = "") { const c = document.getElementById('log-window'); const u = document.getElementById('game-log'); const l = document.createElement('li'); l.innerHTML = `> ${m}`; if(cls) l.className = cls; u.appendChild(l); setTimeout(() => { c.scrollTop = c.scrollHeight; }, 10); },
    update() {
        if(!window.player.classObj) return; 
        document.getElementById('hp').innerText = Math.max(0, window.player.hp); document.getElementById('max-hp').innerText = window.player.maxHp;
        document.getElementById('mp').innerText = window.player.mp; document.getElementById('max-mp').innerText = window.player.maxMp;
        document.getElementById('atk-val').innerText = window.player.atk; document.getElementById('def-val').innerText = window.player.def;
        document.getElementById('lvl').innerText = window.player.lvl; document.getElementById('gold').innerText = window.player.gold; document.getElementById('potions').innerText = window.player.potions;
        document.getElementById('hp-bar').style.width = `${Math.max(0, (window.player.hp / window.player.maxHp) * 100)}%`; document.getElementById('mp-bar').style.width = `${Math.max(0, (window.player.mp / window.player.maxMp) * 100)}%`; document.getElementById('xp-bar').style.width = `${window.player.lvl >= 50 ? 100 : Math.min(100, (window.player.xp / window.player.xpToNext) * 100)}%`;
        if (window.combat.enemy) { document.getElementById('enemy-name-display').innerText = window.combat.enemy.name; document.getElementById('enemy-art-icon').innerText = window.combat.enemy.icon; document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, (window.combat.enemy.hp / window.combat.enemy.maxHp) * 100)}%`; }
    },
    updateInventoryModal() {
        const t = window.lang === 'pt' ? ['Tirar', 'Usar', 'Arma', 'Mão 2', 'Armadura', 'Vazio'] : ['Unequip', 'Equip', 'Weapon', 'Offhand', 'Armor', 'Empty'];
        let eqHTML = "";
        if (window.player.equipped.weapon) eqHTML += `<li class="inv-item"><span>🗡️ ${window.player.equipped.weapon.name} <span style="color:#ffb300;">(+${window.player.equipped.weapon.stat} Atk)</span></span> <button class="inv-btn" onclick="window.player.unequip('weapon')">${t[0]}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🗡️ ${t[2]}: (${t[5]})</li>`;
        if (window.player.equipped.offhand) eqHTML += `<li class="inv-item"><span>🎒 ${window.player.equipped.offhand.name} <span style="color:${window.player.equipped.offhand.adds==='atk'?'#ffb300':'#90caf9'};">(+${window.player.equipped.offhand.stat} ${window.player.equipped.offhand.adds})</span></span> <button class="inv-btn" onclick="window.player.unequip('offhand')">${t[0]}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🎒 ${t[3]}: (${t[5]})</li>`;
        if (window.player.equipped.armor) eqHTML += `<li class="inv-item"><span>🛡️ ${window.player.equipped.armor.name} <span style="color:#90caf9;">(+${window.player.equipped.armor.stat} Def)</span></span> <button class="inv-btn" onclick="window.player.unequip('armor')">${t[0]}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🛡️ ${t[4]}: (${t[5]})</li>`;
        document.getElementById('inv-equipped').innerHTML = eqHTML;

        let bagHTML = `<li class="inv-item"><span>🧪 Poção/Potion (x${window.player.potions})</span> <button class="inv-btn" onclick="window.player.usePotion()">${t[1]}</button></li>`;
        window.player.inventory.forEach((item, index) => {
            let icon = item.type === 'weapon' ? '🗡️' : (item.type === 'armor' ? '🛡️' : '🎒');
            let statType = item.type === 'weapon' ? 'Atk' : (item.type === 'armor' ? 'Def' : (item.adds === 'atk' ? 'Atk' : 'Def'));
            bagHTML += `<li class="inv-item"><span>${icon} ${item.name} <span style="color:${statType==='Atk'?'#ffb300':'#90caf9'};">(+${item.stat} ${statType})</span></span> <button class="inv-btn" onclick="window.player.equip(${index})">${t[1]}</button></li>`;
        });
        document.getElementById('inv-bag').innerHTML = bagHTML;
    },
    openInventory() { window.audio.playClick(); document.getElementById('inventory-modal').classList.remove('hidden'); this.updateInventoryModal(); },
    closeInventory() { window.audio.playClick(); document.getElementById('inventory-modal').classList.add('hidden'); },
    openSettings() { window.audio.playClick(); document.getElementById('settings-modal').classList.remove('hidden'); },
    closeSettings() { window.audio.playClick(); document.getElementById('settings-modal').classList.add('hidden'); },
    toggleMode(b) { document.getElementById('exploration-actions').classList.toggle('hidden', b); document.getElementById('combat-actions').classList.toggle('hidden', !b); document.getElementById('battle-arena').classList.toggle('hidden', !b); },
    animate(id, cls) { const el = document.getElementById(id); if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 350); }
};

window.onload = () => { window.sys.setLang('pt'); if(window.game.loadGame()) document.getElementById('top-menu').classList.remove('hidden'); };
