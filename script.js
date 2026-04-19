// ==========================================
// ESTADO DO JOGO E BANCO DE DADOS
// ==========================================
let state = {
    hero: {
        name: "Herói", class: "", level: 1, xp: 0, nextXp: 50,
        hp: 100, maxHp: 100, mp: 50, maxMp: 50,
        baseAtk: 10, baseDef: 10, str: 10, dex: 10, spd: 10, cha: 10,
        gold: 0, potions: 3
    },
    enemy: null,
    inCombat: false,
    gameBeaten: false,
    inventory: [
        { id: "adaga_velha", name: "Adaga Velha", type: "weapon", stat: 2, value: 5 },
        { id: "roupa_tecido", name: "Roupa de Tecido", type: "body", stat: 1, value: 3 }
    ],
    equipped: { weapon: null, body: null, head: null }
};

const classes = {
    cavaleiro: { name: "Cavaleiro", hp: 150, mp: 30, baseAtk: 12, baseDef: 15, str: 14, dex: 8, spd: 8, cha: 10, icon: "🛡️" },
    mago: { name: "Mago", hp: 80, mp: 100, baseAtk: 18, baseDef: 5, str: 4, dex: 10, spd: 10, cha: 12, icon: "🧙‍♂️" },
    arqueiro: { name: "Arqueiro", hp: 100, mp: 50, baseAtk: 15, baseDef: 8, str: 8, dex: 15, spd: 14, cha: 10, icon: "🏹" },
    anao: { name: "Anão", hp: 180, mp: 20, baseAtk: 14, baseDef: 18, str: 16, dex: 6, spd: 5, cha: 8, icon: "🪓" }
};

const monsterNames = ["Goblin Saqueador", "Lobo Atroz", "Esqueleto Errante", "Orc Brutal", "Aparição Sombria", "Golem de Pedra", "Gárgula"];

const lootTable = [
    { name: "Espada Longa", type: "weapon", stat: 8, value: 25 },
    { name: "Cota de Malha", type: "body", stat: 10, value: 35 },
    { name: "Machado Pesado", type: "weapon", stat: 12, value: 40 },
    { name: "Elmo de Ferro", type: "head", stat: 5, value: 20 },
    { name: "Cajado Arcano", type: "weapon", stat: 15, value: 50 }
];

// Calcula Atributos Totais (Base + Equipamentos)
function getTotalAtk() { return state.hero.baseAtk + (state.equipped.weapon ? state.equipped.weapon.stat : 0); }
function getTotalDef() { 
    return state.hero.baseDef + 
           (state.equipped.body ? state.equipped.body.stat : 0) + 
           (state.equipped.head ? state.equipped.head.stat : 0); 
}

// ==========================================
// FUNÇÕES DE INTERFACE E INVENTÁRIO (UI)
// ==========================================
window.ui = {
    updateHUD: function() {
        const h = state.hero;
        document.getElementById('lvl').innerText = h.level;
        document.getElementById('hp').innerText = Math.max(0, h.hp);
        document.getElementById('max-hp').innerText = h.maxHp;
        document.getElementById('mp').innerText = Math.max(0, h.mp);
        document.getElementById('max-mp').innerText = h.maxMp;
        document.getElementById('atk-val').innerText = getTotalAtk();
        document.getElementById('def-val').innerText = getTotalDef();
        document.getElementById('str-val').innerText = h.str;
        document.getElementById('spd-val').innerText = h.spd;
        document.getElementById('dex-val').innerText = h.dex;
        document.getElementById('cha-val').innerText = h.cha;
        document.getElementById('gold').innerText = h.gold;
        document.getElementById('potions').innerText = h.potions;

        document.getElementById('hp-bar').style.width = `${(h.hp / h.maxHp) * 100}%`;
        document.getElementById('mp-bar').style.width = `${(h.mp / h.maxMp) * 100}%`;
        document.getElementById('xp-bar').style.width = `${(h.xp / h.nextXp) * 100}%`;
    },
    log: function(msg, type = 'sys') {
        const log = document.getElementById('game-log');
        const li = document.createElement('li');
        li.className = type;
        li.innerHTML = msg;
        log.prepend(li);
        if (log.children.length > 20) log.removeChild(log.lastChild);
    },
    openInventory: function() {
        this.renderInventory();
        document.getElementById('inventory-modal').classList.remove('hidden');
    },
    closeInventory: () => document.getElementById('inventory-modal').classList.add('hidden'),
    openSettings: () => document.getElementById('settings-modal').classList.remove('hidden'),
    closeSettings: () => document.getElementById('settings-modal').classList.add('hidden'),
    
    showStoryEvent: function(title, text, options) {
        document.getElementById('story-title').innerText = title;
        document.getElementById('story-text').innerHTML = text;
        const optsContainer = document.getElementById('story-options');
        optsContainer.innerHTML = '';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-medieval';
            btn.innerText = opt.label;
            btn.onclick = () => {
                document.getElementById('story-modal').classList.add('hidden');
                if(opt.action) opt.action();
            };
            optsContainer.appendChild(btn);
        });
        document.getElementById('story-modal').classList.remove('hidden');
    },

    renderInventory: function() {
        const bag = document.getElementById('inv-bag');
        const equipped = document.getElementById('inv-equipped');
        bag.innerHTML = ''; equipped.innerHTML = '';

        // Renderiza Mochila
        if (state.inventory.length === 0) bag.innerHTML = '<li class="inv-item" style="justify-content:center;">Mochila vazia</li>';
        state.inventory.forEach((item, index) => {
            let statText = item.type === 'weapon' ? `⚔️+${item.stat}` : `🛡️+${item.stat}`;
            bag.innerHTML += `
                <li class="inv-item">
                    <span>${item.name} <small>(${statText})</small></span>
                    <div class="inv-btn-group">
                        <button class="inv-btn" onclick="window.inv.equip(${index})">Equipar</button>
                        <button class="inv-btn btn-sell" onclick="window.inv.sell(${index})">${item.value}💰</button>
                    </div>
                </li>`;
        });

        // Renderiza Equipados
        const slots = [{ id: 'head', icon: '🪖' }, { id: 'body', icon: '👕' }, { id: 'weapon', icon: '🗡️' }];
        slots.forEach(slot => {
            let item = state.equipped[slot.id];
            if(item) {
                let statText = item.type === 'weapon' ? `⚔️+${item.stat}` : `🛡️+${item.stat}`;
                equipped.innerHTML += `
                    <li class="inv-item">
                        <span>${slot.icon} ${item.name} <small>(${statText})</small></span>
                        <button class="inv-btn" onclick="window.inv.unequip('${slot.id}')">Remover</button>
                    </li>`;
            } else {
                equipped.innerHTML += `<li class="inv-item" style="color: #8b6b4a;">${slot.icon} Vazio</li>`;
            }
        });
    }
};

window.inv = {
    equip: function(index) {
        let item = state.inventory.splice(index, 1)[0];
        if (state.equipped[item.type]) {
            state.inventory.push(state.equipped[item.type]); // Devolve o atual pra mochila
        }
        state.equipped[item.type] = item;
        window.ui.renderInventory();
        window.ui.updateHUD();
        window.ui.log(`Equipou: ${item.name}`, 'sys');
    },
    unequip: function(slot) {
        let item = state.equipped[slot];
        if(item) {
            state.inventory.push(item);
            state.equipped[slot] = null;
            window.ui.renderInventory();
            window.ui.updateHUD();
            window.ui.log(`Removeu: ${item.name}`, 'sys');
        }
    },
    sell: function(index) {
        let item = state.inventory.splice(index, 1)[0];
        state.hero.gold += item.value;
        window.ui.renderInventory();
        window.ui.updateHUD();
        window.ui.log(`Vendeu ${item.name} por ${item.value} ouros.`, 'loot');
    }
};

// ==========================================
// CONTROLES DO JOGO E HISTÓRIA
// ==========================================
window.game = {
    chooseClass: function(c) {
        state.hero.class = c;
        const cd = classes[c];
        Object.assign(state.hero, cd);
        state.hero.maxHp = cd.hp; state.hero.maxMp = cd.mp;
        document.getElementById('hero-class-name').innerText = cd.name;
        document.getElementById('hero-icon').innerText = cd.icon;
        document.getElementById('player-art-icon').innerText = cd.icon;
        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('name-selection-screen').classList.remove('hidden');
    },
    confirmName: function() {
        const nameInput = document.getElementById('input-hero-name').value.trim();
        if(nameInput) state.hero.name = nameInput;
        document.getElementById('hero-name-display').innerText = state.hero.name;
        document.getElementById('name-selection-screen').classList.add('hidden');
        document.getElementById('main-game-screen').classList.remove('hidden');
        document.getElementById('top-menu').classList.remove('hidden');
        window.ui.updateHUD();

        window.ui.showStoryEvent("O Rapto da Princesa", 
            `Salve, bravo ${state.hero.name}! Aethelgard chora. O <b>Lorde das Sombras</b> surgiu dos abismos e sequestrou a Princesa Elara, trancando-a na Torre do Desespero.<br><br>Sua missão é treinar nos ermos, acumular força e equipamentos, e alcançar o <b>Nível 100</b> para enfrentar o lorde e resgatá-la!`, 
            [{ label: "⚔️ Aceitar o Destino", action: () => window.ui.log("A jornada épica começa...", "sys") }]
        );
    },
    cancelName: function() {
        document.getElementById('name-selection-screen').classList.add('hidden');
        document.getElementById('class-selection-screen').classList.remove('hidden');
    },
    explore: function() {
        if(state.inCombat) return;
        
        if (state.hero.level >= 100 && !state.gameBeaten) {
            triggerFinalBoss();
            return;
        }

        const roll = Math.random();
        if(roll < 0.45) {
            startCombat();
        } else if(roll < 0.75) {
            triggerNPCEvent();
        } else {
            const foundGold = Math.floor(Math.random() * 10) + (state.hero.level * 2);
            state.hero.gold += foundGold;
            window.ui.log(`Você encontrou um baú com ${foundGold} moedas!`, "loot");
            window.ui.updateHUD();
        }
    },
    rest: function() {
        if(state.inCombat) return;
        if(state.hero.gold >= 10) {
            state.hero.gold -= 10;
            state.hero.hp = state.hero.maxHp;
            state.hero.mp = state.hero.maxMp;
            window.ui.log("Você descansou na pousada e recuperou tudo.", "sys");
            window.ui.updateHUD();
        } else {
            window.ui.log("Ouro insuficiente para descansar (Custa 10).", "sys");
        }
    },
    resetGame: function() { location.reload(); }
};

// ==========================================
// SISTEMA DE EVENTOS / NPCs E DICAS DA PRINCESA
// ==========================================
function triggerNPCEvent() {
    const events = [
        {
            title: "A Bruxa da Floresta", 
            text: "Uma velha mexe um caldeirão borbulhante. 'Eu vejo os fios do destino, jovem... A Torre do Desespero rasga os céus. A Princesa está aprisionada no Nível 100. Você precisará de equipamentos fortes se quiser chegar lá vivo.'",
            options: [
                { label: "Obrigado pela dica", action: () => window.ui.log("A bruxa desaparece em uma névoa.", "sys") }
            ]
        },
        {
            title: "Guarda Deserdado", 
            text: "Um soldado com a armadura quebrada tosse sangue. 'Eu tentei salvá-la... mas os monstros do Lorde ficam mais fortes a cada nível que você sobe. O ataque do Lorde das Sombras destruirá sua defesa se você não se equipar direito...'",
            options: [
                { label: "Deixe comigo", action: () => window.ui.log("Você segue em frente com determinação.", "sys") }
            ]
        },
        {
            title: "O Bêbado Visionário", 
            text: "Um homem na taverna grita apontando para o nada: 'O Lorde! Ele não é invencível! Hic... Magia fere ele... espada fere ele... mas se você fugir de suas obrigações, a Princesa Elara chora no cristal negro!'",
            options: [
                { label: "Dar 5 Ouros pela História", action: () => {
                    if(state.hero.gold >= 5) {
                        state.hero.gold -= 5;
                        state.hero.potions++;
                        window.ui.log("O bêbado te entregou uma Poção escondida nas vestes!", "loot");
                        window.ui.updateHUD();
                    } else window.ui.log("Você não tem ouro...", "sys");
                }},
                { label: "Ignorar o louco", action: () => {} }
            ]
        },
        {
            title: "A Fada Vidente", 
            text: "Uma luz brilhante flutua até você. 'Eu sobrevoei o ápice da Torre! A Princesa está envolta em um cristal inquebrável. Apenas a morte do Lorde das Sombras quebrará a maldição. Continue treinando!'",
            options: [
                { label: "✨ Receber Bênção", action: () => {
                    state.hero.hp = state.hero.maxHp;
                    window.ui.log("A fada restaurou toda sua vida com magia de luz!", "skill");
                    window.ui.updateHUD();
                }}
            ]
        },
        {
            title: "O Comerciante Perdido", 
            text: "Um mercador tenta consertar sua carroça. 'Se você me ajudar, lhe dou algo especial. O caminho para a Princesa é longo e escuro!'",
            options: [
                { label: "🛠️ Ajudar na carroça", action: () => {
                    let item = lootTable[Math.floor(Math.random() * lootTable.length)];
                    state.inventory.push({...item});
                    window.ui.log(`O mercador lhe deu: ${item.name}! Veja na mochila.`, "loot");
                }},
                { label: "Não tenho tempo", action: () => {} }
            ]
        }
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    window.ui.showStoryEvent(ev.title, ev.text, ev.options);
}

// ==========================================
// SISTEMA DE COMBATE E LOOT
// ==========================================
function startCombat(specificEnemy = null) {
    state.inCombat = true;
    const isBoss = specificEnemy === "Lorde das Sombras";
    
    const multiplier = 1 + (state.hero.level * 0.3);
    state.enemy = {
        name: specificEnemy || monsterNames[Math.floor(Math.random() * monsterNames.length)] + ` Nvl ${state.hero.level}`,
        hp: Math.floor((isBoss ? 800 : 40) * multiplier),
        maxHp: Math.floor((isBoss ? 800 : 40) * multiplier),
        atk: Math.floor((isBoss ? 30 : 10) * multiplier),
        def: Math.floor((isBoss ? 20 : 5) * multiplier),
        icon: isBoss ? "🐉" : "👺"
    };

    document.getElementById('enemy-name-display').innerText = state.enemy.name;
    document.getElementById('enemy-art-icon').innerText = state.enemy.icon;
    document.getElementById('enemy-hp-bar').style.width = "100%";
    
    document.getElementById('exploration-actions').classList.add('hidden');
    document.getElementById('combat-actions').classList.remove('hidden');
    document.getElementById('battle-arena').classList.remove('hidden');

    window.ui.log(`Um ${state.enemy.name} bloqueia o caminho!`, "sys");
}

function triggerFinalBoss() {
    window.ui.showStoryEvent("O Ápice da Torre", 
        `Os portões de ferro pesado se abrem. O chão treme e o ar fica gélido. O <b>Lorde das Sombras</b> levanta de seu trono. Atrás dele, a Princesa Elara bate as mãos em desespero dentro de um cristal negro aprisionador.<br><br>"Você ousa invadir meu domínio? Aethelgard e a princesa serão meus. Sua jornada patética termina aqui!"`, 
        [{ label: "⚔️ PELO REINO E PELA PRINCESA!", action: () => startCombat("Lorde das Sombras") }]
    );
}

window.combat = {
    attack: function() {
        if(!state.inCombat) return;
        document.getElementById('player-portrait').classList.add('anim-attack');
        setTimeout(() => document.getElementById('player-portrait').classList.remove('anim-attack'), 300);

        let dmg = Math.max(1, getTotalAtk() - (state.enemy.def / 2) + Math.floor(Math.random() * 5));
        state.enemy.hp -= dmg;
        window.ui.log(`Ataque físico causando ${Math.floor(dmg)} de dano!`, "dmg-dealt");
        checkCombatStatus();
    },
    useSkill: function() {
        if(!state.inCombat || state.hero.mp < 15) {
            window.ui.log("Mana insuficiente! (Custa 15)", "sys");
            return;
        }
        state.hero.mp -= 15;
        let dmg = Math.max(5, (getTotalAtk() * 1.5) - (state.enemy.def / 3));
        state.enemy.hp -= dmg;
        window.ui.log(`Habilidade especial causou ${Math.floor(dmg)} de dano mágico!`, "skill");
        window.ui.updateHUD();
        checkCombatStatus();
    },
    flee: function() {
        if(state.enemy.name === "Lorde das Sombras") {
            window.ui.log("Você não pode abandonar a Princesa agora!", "dmg-taken");
            enemyTurn();
            return;
        }
        if(Math.random() > 0.4) {
            window.ui.log("Você fugiu para a floresta!", "sys");
            endCombat();
        } else {
            window.ui.log("O monstro te impediu de fugir!", "sys");
            enemyTurn();
        }
    }
};

window.player = {
    buyPotion: function() {
        if(state.hero.gold >= 20) {
            state.hero.gold -= 20;
            state.hero.potions++;
            window.ui.log("Poção comprada na estalagem!", "loot");
            window.ui.updateHUD();
        } else window.ui.log("Ouro insuficiente.", "sys");
    },
    usePotion: function() {
        if(state.hero.potions > 0) {
            state.hero.potions--;
            let heal = Math.floor(state.hero.maxHp * 0.4);
            state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + heal);
            window.ui.log(`Poção curou ${heal} HP.`, "skill");
            window.ui.updateHUD();
            if(state.inCombat) enemyTurn();
        } else window.ui.log("Mochila sem poções!", "sys");
    }
};

function enemyTurn() {
    if(state.enemy.hp <= 0) return;
    
    document.getElementById('enemy-portrait').classList.add('anim-attack');
    setTimeout(() => document.getElementById('enemy-portrait').classList.remove('anim-attack'), 300);

    let dmg = Math.max(1, state.enemy.atk - (getTotalDef() / 2) + Math.floor(Math.random() * 3));
    state.hero.hp -= dmg;
    
    document.querySelector('.hp-container').classList.add('anim-shake');
    setTimeout(() => document.querySelector('.hp-container').classList.remove('anim-shake'), 300);

    window.ui.log(`${state.enemy.name} te atingiu com ${Math.floor(dmg)} de dano!`, "dmg-taken");
    window.ui.updateHUD();

    if(state.hero.hp <= 0) {
        window.ui.log("Você sucumbiu aos ferimentos...", "dmg-taken");
        state.inCombat = false;
        setTimeout(() => {
            alert("A escuridão tomou conta de Aethelgard e a Princesa está perdida. Tente novamente.");
            location.reload();
        }, 1500);
    }
}

function checkCombatStatus() {
    document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
    
    if(state.enemy.hp <= 0) {
        if(state.enemy.name === "Lorde das Sombras") {
            state.gameBeaten = true;
            endCombat();
            window.ui.showStoryEvent("A Luz Retorna a Aethelgard", 
                `Com um último grito agonizante, o Lorde das Sombras se desfaz em cinzas. O cristal negro explode em mil pedaços de luz.<br><br>A <b>Princesa Elara</b> corre até você, livre enfim. "Você conseguiu! O mal foi purgado de nossas terras, meu herói!"<br><br><b>O REI DECLARA FERIADO EM SEU NOME. VOCÊ ZEROU O JOGO!</b>`, 
                [{ label: "Continuar Patrulhando o Reino", action: () => {} }]
            );
            return;
        }

        let xpGained = 15 + (state.hero.level * 5);
        let goldGained = 5 + Math.floor(Math.random() * 10) + state.hero.level;
        state.hero.xp += xpGained;
        state.hero.gold += goldGained;
        window.ui.log(`Vitória! +${xpGained} XP, +${goldGained} Ouro.`, "loot");
        
        // Chance de Loot
        if(Math.random() < 0.3) {
            let droppedItem = lootTable[Math.floor(Math.random() * lootTable.length)];
            // Cria cópia do item para não dar problema de referência
            state.inventory.push({...droppedItem});
            window.ui.log(`Inimigo derrubou: ${droppedItem.name}!`, "loot");
        }
        
        checkLevelUp();
        endCombat();
    } else {
        setTimeout(enemyTurn, 800);
    }
}

function checkLevelUp() {
    if(state.hero.xp >= state.hero.nextXp && state.hero.level < 100) {
        state.hero.level++;
        state.hero.xp = 0;
        state.hero.nextXp = Math.floor(state.hero.nextXp * 1.5);
        
        state.hero.maxHp += 15; state.hero.hp = state.hero.maxHp;
        state.hero.maxMp += 5; state.hero.mp = state.hero.maxMp;
        state.hero.baseAtk += 3; state.hero.baseDef += 2;
        
        window.ui.log(`🌟 NÍVEL ${state.hero.level}! Você está mais perto da Princesa!`, "skill");
        window.ui.updateHUD();
    }
}

function endCombat() {
    state.inCombat = false;
    document.getElementById('battle-arena').classList.add('hidden');
    document.getElementById('combat-actions').classList.add('hidden');
    document.getElementById('exploration-actions').classList.remove('hidden');
    window.ui.updateHUD();
}

window.sys = {
    setLang: function(lang) { alert("Idioma alterado para " + lang.toUpperCase() + " (Em breve na v2)"); },
    exitSave: function() { 
        localStorage.setItem('aethelgard_save', JSON.stringify(state));
        alert("O progresso do seu herói foi guardado nas crônicas de Aethelgard!"); 
    }
};

window.onload = function() {
    const saved = localStorage.getItem('aethelgard_save');
    if(saved) {
        if(confirm("Deseja carregar seu jogo salvo e continuar a busca pela Princesa?")) {
            state = JSON.parse(saved);
            document.getElementById('class-selection-screen').classList.add('hidden');
            document.getElementById('name-selection-screen').classList.add('hidden');
            document.getElementById('main-game-screen').classList.remove('hidden');
            document.getElementById('top-menu').classList.remove('hidden');
            document.getElementById('hero-name-display').innerText = state.hero.name;
            document.getElementById('player-art-icon').innerText = classes[state.hero.class]?.icon || "🤺";
            window.ui.updateHUD();
        }
    }
};
