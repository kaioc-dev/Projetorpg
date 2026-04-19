// Callback do Google Sign In
function handleCredentialResponse(response) {
    console.log("Token do Google recebido:", response.credential);
    window.ui.log("☁️ Conta Google conectada com sucesso!", "sys");
    document.getElementById('txt-cloud-info').innerText = "Conta conectada. Progresso sincronizado!";
}

window.audio = {
    bgm: new Audio('bgm.mp3'), clickSfx: new Audio('click.mp3'),
    attackSfx: new Audio('attack.mp3'), gruntSfx: new Audio('grunt.mp3'), bgmStarted: false,
    init() { this.bgm.loop = true; this.bgm.volume = 0.3; this.clickSfx.volume = 0.7; this.attackSfx.volume = 1.0; this.gruntSfx.volume = 0.8; },
    startBGM() { if (!this.bgmStarted) { let p = this.bgm.play(); if (p !== undefined) { p.then(() => { this.bgmStarted = true; }).catch(e => {}); } } },
    playClick() { this.clickSfx.currentTime = 0; this.clickSfx.play().catch(()=>{}); },
    playAttack() { this.attackSfx.currentTime = 0; this.attackSfx.play().catch(()=>{}); },
    playGrunt() { this.gruntSfx.currentTime = 0; this.gruntSfx.play().catch(()=>{}); }
};
window.audio.init();

window.lang = 'pt';
const i18n = {
    pt: {
        choose: "Escolha seu destino:", explore: "🌲 Explorar", rest: "🛌 Pousada (10💰)", buy: "🛒 Comprar Poção (20💰)",
        attack: "⚔️ Atacar!", potion: "🧪 Poção", flee: "🏃 Fugir", bag: "🎒 Bolsa", gold: "Ouro", potions: "Poções",
        you: "Você", lvl: "Nvl", atk: "Atk", def: "Def", open_bag: "(Toque para abrir)",
        invTitle: "🎒 Equipamentos", equipped: "🤺 Corpo", bagItems: "📦 Mochila",
        settings: "⚙️ Sistema", lang: "Idioma", saveGame: "💾 Salvar Local e Sair", resetGame: "⚠️ Apagar Save",
        closeSet: "Voltar ao Jogo", unequip: "Tirar", equip: "Equipar", sell: "Vender", use: "Beber", empty: "Vazio"
    },
    en: {
        choose: "Choose your destiny:", explore: "🌲 Explore", rest: "🛌 Inn (10💰)", buy: "🛒 Buy Potion (20💰)",
        attack: "⚔️ Attack!", potion: "🧪 Potion", flee: "🏃 Flee", bag: "🎒 Bag", gold: "Gold", potions: "Potions",
        you: "You", lvl: "Lvl", atk: "Atk", def: "Def", open_bag: "(Tap to open)",
        invTitle: "🎒 Equipment", equipped: "🤺 Body", bagItems: "📦 Backpack",
        settings: "⚙️ System", lang: "Language", saveGame: "💾 Local Save & Exit", resetGame: "⚠️ Erase Save",
        closeSet: "Back to Game", unequip: "Unequip", equip: "Equip", sell: "Sell", use: "Drink", empty: "Empty"
    }
};

window.sys = {
    setLang(l) {
        window.audio.playClick(); window.lang = l; const d = i18n[l];
        document.getElementById('txt-choose').innerText = d.choose; document.getElementById('btn-explore').innerText = d.explore;
        document.getElementById('btn-rest').innerText = d.rest; document.getElementById('btn-buy-potion').innerText = d.buy;
        document.getElementById('btn-attack').innerText = d.attack; document.getElementById('btn-use-potion').innerText = d.potion;
        document.getElementById('btn-flee').innerText = d.flee; document.getElementById('txt-bag').innerText = d.bag;
        document.getElementById('txt-open-bag').innerText = d.open_bag; document.getElementById('txt-inv-title').innerText = d.invTitle;
        document.getElementById('txt-equipped').innerText = d.equipped; document.getElementById('txt-bag-items').innerText = d.bagItems;
        document.getElementById('txt-settings-title').innerText = d.settings; document.getElementById('txt-lang').innerText = d.lang;
        document.getElementById('txt-save').innerText = d.saveGame; document.getElementById('txt-reset').innerText = d.resetGame;
        document.getElementById('txt-close-settings').innerText = d.closeSet;
        if(window.player && window.player.classObj) window.ui.updateInventoryModal();
    },
    exitSave() { window.audio.playClick(); window.game.saveGame(); location.reload(); }
};

window.classesData = {
    cavaleiro: { name: "Cavaleiro", icon: "🛡️", hp: 120, mp: 20, atk: 10, def: 5, str: 8, dex: 4, spd: 3, cha: 5, skillName: "Golpe Duplo", skillCost: 10, skillMult: 2.0 },
    mago: { name: "Mago", icon: "🧙‍♂️", hp: 70, mp: 60, atk: 6, def: 1, str: 2, dex: 5, spd: 6, cha: 7, skillName: "Bola de Fogo", skillCost: 20, skillMult: 3.5 },
    arqueiro: { name: "Arqueiro", icon: "🏹", hp: 90, mp: 30, atk: 14, def: 3, str: 4, dex: 9, spd: 8, cha: 4, skillName: "Tiro Preciso", skillCost: 15, skillMult: 2.5 },
    anao: { name: "Anão", icon: "🪓", hp: 160, mp: 15, atk: 9, def: 8, str: 10, dex: 3, spd: 2, cha: 3, skillName: "Fúria", skillCost: 15, skillMult: 1.8 }
};

// Bestiário Comum
window.bestiary = [ 
    { name: "Goblin Ladrão", baseHp: 30, baseAtk: 8, baseXp: 25, baseGold: 10, icon: "👺" }, 
    { name: "Lobo Feroz", baseHp: 45, baseAtk: 12, baseXp: 40, baseGold: 15, icon: "🐺" }, 
    { name: "Orc Bárbaro", baseHp: 80, baseAtk: 18, baseXp: 70, baseGold: 35, icon: "👹" }, 
    { name: "Esqueleto Amaldiçoado", baseHp: 60, baseAtk: 15, baseXp: 55, baseGold: 20, icon: "💀" },
    { name: "Cultista da Ruína", baseHp: 90, baseAtk: 22, baseXp: 85, baseGold: 40, icon: "🦹" },
    { name: "Aranha Gigante", baseHp: 70, baseAtk: 25, baseXp: 60, baseGold: 15, icon: "🕷️" }
];

// O BANCO DE DADOS DA HISTÓRIA E DOS CHEFÕES (15 Chefões)
window.bossesDB = { 
    10: { name: "Rei Goblin", baseHp: 180, baseAtk: 25, baseXp: 300, baseGold: 100, icon: "👑", loreTitle: "Uma Pista nas Cavernas", loreDesc: "O Rei Goblin tomba no chão frio. Revistando seu trono, você encontra um pingente com o brasão real. A Princesa Seraphina foi trazida por aqui e entregue às feras da Floresta de Sangue. A caçada continua." }, 
    20: { name: "Fera das Sombras", baseHp: 250, baseAtk: 40, baseXp: 800, baseGold: 250, icon: "🐺", loreTitle: "Sangue e Sombras", loreDesc: "A imensa fera vira pó. Amarrado em uma árvore próxima, você acha um pedaço rasgado do vestido da princesa. Eles estão se movendo rápido em direção aos Acampamentos de Guerra." }, 
    30: { name: "General Orc", baseHp: 400, baseAtk: 60, baseXp: 2000, baseGold: 500, icon: "🪓", loreTitle: "Ordem de Marcha", loreDesc: "No bolso do General, uma carta carimbada com o selo negro da Ruína: 'Levem a garota pelo Pântano da Névoa até o nosso mestre'. Você precisa se apressar!" }, 
    40: { name: "Bruxa do Pântano", baseHp: 600, baseAtk: 85, baseXp: 5000, baseGold: 1000, icon: "🧙‍♀️", loreTitle: "Visões do Futuro", loreDesc: "O caldeirão da bruxa explode. Na fumaça, você tem uma visão da Princesa presa em uma gaiola de fogo nas costas de um ser alado monstruoso." }, 
    50: { name: "Dragão Negro", baseHp: 1200, baseAtk: 130, baseXp: 10000, baseGold: 5000, icon: "🐉", loreTitle: "Os Portões do Abismo", loreDesc: "Com seu último suspiro, o dragão colossal esmaga a rocha, revelando uma escadaria de ossos que desce direto para o submundo de Aethelgard. É lá que o ritual vai acontecer." }, 
    60: { name: "Golem de Sangue", baseHp: 1800, baseAtk: 180, baseXp: 15000, baseGold: 8000, icon: "🩸", loreTitle: "Os Guardiões de Pedra", loreDesc: "O golem se desfaz em um mar de sangue. Você percebe que a magia sombria do Deus da Ruína está ficando muito mais densa. A princesa ainda está viva, você pode sentir a Luz dela." }, 
    70: { name: "Assassino Fantasma", baseHp: 2500, baseAtk: 240, baseXp: 22000, baseGold: 12000, icon: "👻", loreTitle: "Frio na Espinha", loreDesc: "A aparição se dissipa rindo. 'Você está atrasado, herói. A coroa dela já foi tomada.' Você cerra os punhos e continua a descer pelo abismo." }, 
    80: { name: "Cavaleiro Corrompido", baseHp: 3500, baseAtk: 300, baseXp: 30000, baseGold: 15000, icon: "🗡️", loreTitle: "Traição Descoberta", loreDesc: "Você tira o elmo do cavaleiro e descobre ser Sir Galahad, antigo mestre de armas da Princesa. A corrupção o havia dominado. Ele sussurra: 'Salve-a... por favor...' antes de morrer." }, 
    90: { name: "Quimera do Caos", baseHp: 5000, baseAtk: 400, baseXp: 40000, baseGold: 20000, icon: "🦁", loreTitle: "O Labirinto Quebrado", loreDesc: "O monstro urra e desaba, quebrando a parede do labirinto abissal. Ao longe, você avista um palácio flutuante de cristal escuro. O covil do inimigo." }, 
    100: { name: "Titã Esquecido", baseHp: 7000, baseAtk: 500, baseXp: 55000, baseGold: 30000, icon: "🗿", loreTitle: "O Guardião da Ponte", loreDesc: "A colossal ponte de energia se estabiliza com a queda do Titã. Agora você tem acesso ao palácio interno do Deus da Ruína." }, 
    110: { name: "Aranha Tecelã de Almas", baseHp: 9000, baseAtk: 650, baseXp: 70000, baseGold: 40000, icon: "🕷️", loreTitle: "A Teia do Destino", loreDesc: "Entre os casulos, você acha a coroa de luz da princesa, caída no chão. Ela resistiu, lutou e fugiu mais para dentro do palácio! Ela precisa de você." }, 
    120: { name: "Devorador de Mundos", baseHp: 12000, baseAtk: 800, baseXp: 90000, baseGold: 50000, icon: "🌌", loreTitle: "A Realidade se Desfaz", loreDesc: "O tempo e o espaço começam a distorcer ao seu redor. O Devorador protegia a câmara de rituais. O céu (ou o que sobrou dele) fica vermelho-sangue." }, 
    130: { name: "Sumo Sacerdote", baseHp: 16000, baseAtk: 950, baseXp: 120000, baseGold: 60000, icon: "👁️", loreTitle: "O Cântico Final", loreDesc: "O sacerdote ri com a boca cheia de sangue: 'O ritual já começou! O Deus da Ruína encarnará no corpo da Princesa da Luz!'" }, 
    140: { name: "Arauto da Ruína", baseHp: 22000, baseAtk: 1200, baseXp: 180000, baseGold: 80000, icon: "👹", loreTitle: "A Antessala do Fim", loreDesc: "Você chuta as imensas portas do salão principal. Lá dentro, envolto em um turbilhão de magia negra, o próprio Deus da Ruína se prepara para absorver a Princesa Seraphina. É agora ou nunca!" }, 
    150: { name: "Deus da Ruína", baseHp: 35000, baseAtk: 1800, baseXp: 0, baseGold: 500000, icon: "💀", loreTitle: "👑 O Triunfo da Luz", loreDesc: "A divindade sombria explode em milhares de feixes de luz diante do seu poder avassalador. As correntes que prendiam a Princesa Seraphina se quebram e ela cai em seus braços, segura e a salvo.\n\nEla abre os olhos, sorri e diz: 'Você não desistiu de mim, Herói. Você salvou todo o reino de Aethelgard.'\n\nPARABÉNS! VOCÊ ZEROU O JOGO! (Seu progresso será resetado para você tentar com outra classe!)" }
};

window.lootTables = {
    weapons: [ { name: "Adaga Velha", type: "weapon", stat: 2 }, { name: "Espada Longa", type: "weapon", stat: 5 }, { name: "Lâmina Épica", type: "weapon", stat: 15 }, { name: "Lança Destruidora", type: "weapon", stat: 30 } ],
    armors: [ { name: "Túnica Esfarrapada", type: "armor", stat: 2 }, { name: "Cota de Malha", type: "armor", stat: 5 }, { name: "Placas Divinas", type: "armor", stat: 18 }, { name: "Armadura do Abismo", type: "armor", stat: 35 } ],
    offhands: [ { name: "Broquel", type: "offhand", adds: "def", stat: 3 }, { name: "Grimório", type: "offhand", adds: "atk", stat: 4 }, { name: "Escudo Divino", type: "offhand", adds: "def", stat: 10 }, { name: "Orbe das Almas", type: "offhand", adds: "atk", stat: 25 } ]
};

// -----------------------------------------------------
// HISTÓRIAS INTERATIVAS & NPCs VARIADOS
// -----------------------------------------------------
window.events = [
    {
        title: "🍻 O Bêbado na Taverna",
        desc: "Você entra em uma estalagem suja. Um velho bêbado bate na mesa e grita: 'A princesa já era! Os monstros vão engolir a todos nós! Me pague uma bebida e eu conto o que vi!'",
        choices: [
            {
                text: "🍺 Pagar a bebida (15💰)",
                action: () => {
                    if (window.player.gold >= 15) {
                        window.player.gold -= 15; window.player.gainXp(120);
                        window.ui.log("🗣️ Ele toma a cerveja de um gole só e murmura segredos sobre pontos fracos de monstros. Você ganhou XP e conhecimento!", "skill");
                    } else { window.ui.log("❌ O velho resmunga: 'Se não tem ouro, não tem conversa.' e vira as costas.", "sys"); }
                }
            },
            {
                text: "💪 Intimidar o Velho (Exige Força)",
                action: () => {
                    if (window.player.str >= 15) {
                        window.ui.log("💥 Você levanta o velho pelo colarinho! Assustado, ele te dá 30💰 que roubou de outro aventureiro.", "loot");
                        window.player.gold += 30;
                    } else {
                        window.ui.log("🍻 O velho, incrivelmente forte, quebra uma garrafa na sua cabeça! Você perde HP.", "dmg-taken");
                        window.player.hp = Math.max(1, window.player.hp - 20);
                    }
                }
            }
        ]
    },
    {
        title: "🧚‍♀️ A Fada Encurralada",
        desc: "Você ouve um tilintar desesperado. Uma fada luminosa está presa dentro de uma garrafa de vidro encantada deixada por cultistas.",
        choices: [
            {
                text: "🎯 Quebrar a tampa delicadamente (Exige Destreza)",
                action: () => {
                    if (window.player.dex >= 12) {
                        window.ui.log("✨ A fada é libertada! Como agradecimento, ela aumenta sua Velocidade permanentemente e te cura!", "loot");
                        window.player.spd += 2; window.player.heal(window.player.maxHp); window.player.recalculateStats();
                    } else {
                        window.ui.log("💥 A garrafa escorrega e cai, mas a fada foge. Ela te joga uma maldição leve de susto.", "sys");
                    }
                }
            },
            {
                text: "🪓 Esmagar a garrafa com força (Exige Força)",
                action: () => {
                    if (window.player.str >= 20) {
                        window.ui.log("✨ A garrafa vira pó. A fada, meio atordoada, te dá 2 Poções e some!", "loot");
                        window.player.potions += 2;
                    } else {
                        window.ui.log("🩸 Os estilhaços mágicos cortam você, e a fada foge magoada.", "dmg-taken");
                        window.player.hp = Math.max(1, window.player.hp - 15);
                    }
                }
            }
        ]
    },
    {
        title: "🛍️ O Mercador das Sombras",
        desc: "No meio do nada, um homem misterioso com uma carroça escura te chama. 'Tenho itens poderosos, herói. Não me pergunte de onde tirei.'",
        choices: [
            {
                text: "💰 Comprar pacote misterioso (50💰)",
                action: () => {
                    if (window.player.gold >= 50) {
                        window.player.gold -= 50;
                        window.player.baseAtk += 2; window.player.baseDef += 2; window.player.recalculateStats();
                        window.ui.log("📦 Era um Elixir de Sangue do Dragão! Seus atributos base de Atk e Def aumentaram permanentemente!", "skill");
                    } else { window.ui.log("❌ O mercador ri: 'Volte quando não for um mendigo.'", "sys"); }
                }
            },
            {
                text: "🗣️ Pechinchar no Carisma",
                action: () => {
                    if (window.player.cha >= 20) {
                        window.ui.log("🎁 Você o convence de que salvar a princesa o tornará um nobre. Ele te dá 3 Poções de graça!", "loot");
                        window.player.potions += 3;
                    } else {
                        window.ui.log("😡 Ele se ofende com sua lábia barata e solta seus cães de guarda. Você foge perdendo 15 HP!", "dmg-taken");
                        window.player.hp = Math.max(1, window.player.hp - 15);
                    }
                }
            },
            { text: "🚶 Ignorar a oferta", action: () => { window.ui.log("🚶 Você passa direto, não confiando nas sombras.", "sys"); } }
        ]
    },
    {
        title: "🥷 A Falsa Donzela",
        desc: "Você vê uma mulher encapuzada chorando na estrada. Ao se aproximar, ela saca duas adagas venenosas. É uma assassina da Ruína!",
        choices: [
            {
                text: "💨 Desviar do golpe letal (Exige Velocidade)",
                action: () => {
                    if (window.player.spd >= 15) {
                        window.ui.log("💨 Como um raio, você desvia, desarma a assassina e a faz fugir derrubando sua bolsa com 50💰!", "loot");
                        window.player.gold += 50;
                    } else {
                        window.ui.log("🩸 Muito lento! As adagas rasgam sua armadura e o veneno entra na sua corrente sanguínea.", "dmg-taken");
                        window.player.hp = Math.max(1, window.player.hp - 35);
                    }
                }
            },
            { text: "⚔️ Preparar Defesa Rápida", action: () => { window.ui.log("🛡️ Você toma um arranhão leve (-10 HP), mas a obriga a recuar.", "sys"); window.player.hp = Math.max(1, window.player.hp - 10); } }
        ]
    },
    {
        title: "👴 O Velho Mendigo",
        desc: "Um velhinho cego, sentado em uma pedra à beira do abismo, estende uma tigela de madeira vazia. 'Uma moeda para quem nada tem...'",
        choices: [
            {
                text: "💰 Dar 20 Ouro",
                action: () => {
                    if (window.player.gold >= 20) {
                        window.player.gold -= 20;
                        window.player.cha += 5; window.player.recalculateStats();
                        window.ui.log("✨ O mendigo sorri e se transforma no Deus da Justiça! Ele abençoa você com +5 de Carisma e o cura!", "skill");
                        window.player.heal(window.player.maxHp);
                    } else { window.ui.log("❌ Você tenta ajudar, mas sua bolsa está vazia. O velho apenas acena.", "sys"); }
                }
            },
            { text: "🚶 Ignorar", action: () => { window.ui.log("🚶 O mundo já é cruel demais. Você guarda seu ouro para a missão.", "sys"); } }
        ]
    }
];

window.player = {
    playerName: "Herói", classObj: null, lvl: 1, xp: 0, xpToNext: 50, gold: 0, potions: 3, highestBossDefeated: 0,
    hp: 0, maxHp: 0, mp: 0, maxMp: 0, baseAtk: 0, baseDef: 0, atk: 0, def: 0, str: 0, dex: 0, spd: 0, cha: 0,
    inventory: [], equipped: { weapon: null, armor: null, offhand: null },

    recalculateStats() {
        let offAtk = (this.equipped.offhand && this.equipped.offhand.adds === 'atk') ? this.equipped.offhand.stat : 0;
        let offDef = (this.equipped.offhand && this.equipped.offhand.adds === 'def') ? this.equipped.offhand.stat : 0;
        let strBonus = Math.floor(this.str / 3); let dexBonus = Math.floor(this.dex / 4);
        this.atk = this.baseAtk + (this.equipped.weapon ? this.equipped.weapon.stat : 0) + offAtk + strBonus;
        this.def = this.baseDef + (this.equipped.armor ? this.equipped.armor.stat : 0) + offDef + dexBonus;
        window.ui.update();
    },

    equip(i) {
        window.audio.playClick(); let item = this.inventory[i];
        if (this.equipped[item.type]) this.inventory.push(this.equipped[item.type]);
        this.equipped[item.type] = item; this.inventory.splice(i, 1);
        this.recalculateStats(); window.ui.updateInventoryModal(); window.game.saveGame();
    },
    unequip(s) { window.audio.playClick(); if (this.equipped[s]) { this.inventory.push(this.equipped[s]); this.equipped[s] = null; this.recalculateStats(); window.ui.updateInventoryModal(); window.game.saveGame(); } },
    sell(i) {
        window.audio.playClick(); let item = this.inventory[i];
        let sellPrice = (item.stat * 5) + Math.floor(this.cha / 2); 
        this.gold += sellPrice; this.inventory.splice(i, 1);
        window.ui.log(`💰 Vendeu ${item.name} por ${sellPrice} ouro.`, "loot");
        window.ui.update(); window.ui.updateInventoryModal(); window.game.saveGame();
    },

    heal(v) { this.hp = Math.min(this.hp + v, this.maxHp); window.ui.update(); },
    restoreMp(v) { this.mp = Math.min(this.mp + v, this.maxMp); window.ui.update(); },
    
    usePotion() {
        window.audio.playClick();
        if (this.potions <= 0) return window.ui.log("❌ Sem poções!", "dmg-taken");
        if (this.hp === this.maxHp && this.mp === this.maxMp) return;
        this.potions--; this.heal(60); this.restoreMp(40);
        window.ui.log(`🧪 Curou/Healed.`, "loot"); window.ui.updateInventoryModal();
        if (window.game.state === 'combat') { document.getElementById('inventory-modal').classList.add('hidden'); setTimeout(() => window.combat.enemyTurn(), 800); } 
        else window.game.saveGame();
    },
    buyPotion() {
        window.audio.playClick();
        let price = Math.max(5, 20 - Math.floor(this.cha / 5));
        if (this.gold >= price) { this.gold -= price; this.potions++; window.ui.log(`🛒 +1 Poção (${price}💰).`, "loot"); window.ui.update(); window.game.saveGame(); } 
        else window.ui.log("❌ Ouro insuficiente.");
    },

    gainXp(v) {
        if (this.lvl >= 150) return;
        this.xp += v;
        if (this.xp >= this.xpToNext) {
            this.lvl++; this.xp -= this.xpToNext; this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.maxHp += 15; this.hp = this.maxHp; this.maxMp += 5; this.mp = this.maxMp; this.baseAtk += 3; this.baseDef += 1; 
            this.str += Math.floor(Math.random() * 2) + 1; this.dex += Math.floor(Math.random() * 2) + 1;
            this.spd += Math.floor(Math.random() * 2) + 1; this.cha += Math.floor(Math.random() * 2) + 1;
            this.recalculateStats(); window.ui.log(`🎊 NÍVEL UP: ${this.lvl}!`, "loot");
        }
    }
};

window.game = {
    state: 'menu', tempClassKey: null,
    saveGame() { if (!window.player.classObj) return; localStorage.setItem('aethelgard_save', JSON.stringify(window.player)); },
    loadGame() {
        try {
            const saved = localStorage.getItem('aethelgard_save');
            if (saved) {
                Object.assign(window.player, JSON.parse(saved));
                window.player.str = window.player.str || window.player.classObj.str; window.player.dex = window.player.dex || window.player.classObj.dex;
                window.player.spd = window.player.spd || window.player.classObj.spd; window.player.cha = window.player.cha || window.player.classObj.cha;
                
                document.getElementById('hero-name-display').innerText = window.player.playerName || "Herói";
                document.getElementById('hero-icon').innerText = window.player.classObj.icon; document.getElementById('player-art-icon').innerText = window.player.classObj.icon;
                document.getElementById('hero-class-name').innerText = window.player.classObj.name; document.getElementById('skill-name').innerText = window.player.classObj.skillName;

                document.getElementById('class-selection-screen').classList.add('hidden');
                if (document.getElementById('name-selection-screen')) document.getElementById('name-selection-screen').classList.add('hidden');
                document.getElementById('main-game-screen').classList.remove('hidden'); document.getElementById('top-menu').classList.remove('hidden');
                
                this.state = 'explore'; window.player.recalculateStats(); 
                document.body.addEventListener('click', () => { window.audio.startBGM(); }, { once: true }); return true;
            }
        } catch(e) { localStorage.removeItem('aethelgard_save'); } return false;
    },
    resetGame() { window.audio.playClick(); if(confirm(window.lang==='pt'?"Apagar todo seu progresso e perder a princesa para sempre?":"Delete all progress?")) { localStorage.removeItem('aethelgard_save'); location.reload(); } },
    
    chooseClass(key) { window.audio.playClick(); this.tempClassKey = key; document.getElementById('class-selection-screen').classList.add('hidden'); document.getElementById('name-selection-screen').classList.remove('hidden'); document.getElementById('input-hero-name').focus(); },
    cancelName() { window.audio.playClick(); this.tempClassKey = null; document.getElementById('name-selection-screen').classList.add('hidden'); document.getElementById('class-selection-screen').classList.remove('hidden'); },
    
    confirmName() {
        const input = document.getElementById('input-hero-name').value.trim();
        if (!input) { alert("Por favor, batize seu herói!"); return; }
        window.audio.playClick(); window.audio.startBGM(); window.player.playerName = input;
        const cls = window.classesData[this.tempClassKey]; window.player.classObj = cls;
        window.player.hp = cls.hp; window.player.maxHp = cls.hp; window.player.mp = cls.mp; window.player.maxMp = cls.mp;
        window.player.baseAtk = cls.atk; window.player.baseDef = cls.def; 
        window.player.str = cls.str; window.player.dex = cls.dex; window.player.spd = cls.spd; window.player.cha = cls.cha; window.player.recalculateStats();
        
        document.getElementById('hero-name-display').innerText = window.player.playerName; document.getElementById('hero-icon').innerText = cls.icon; 
        document.getElementById('player-art-icon').innerText = cls.icon; document.getElementById('hero-class-name').innerText = cls.name; document.getElementById('skill-name').innerText = cls.skillName;
        document.getElementById('name-selection-screen').classList.add('hidden'); document.getElementById('main-game-screen').classList.remove('hidden'); document.getElementById('top-menu').classList.remove('hidden');
        this.state = 'explore'; 
        
        // A GRANDE INTRODUÇÃO (PRÓLOGO)
        window.ui.triggerPureStory(
            "👑 O Sequestro Real",
            `Aethelgard está em ruínas. Durante o banquete do Festival da Colheita, o céu escureceu e o imponente Deus da Ruína rasgou os céus, raptando a Princesa Seraphina, portadora da Luz Ancestral.\n\nSua majestade, o Rei, implora por salvação. ${window.player.playerName}, as lendas falaram sobre você. O destino da princesa e do mundo dependem da sua lâmina.\n\nDerrote os emissários das trevas a cada 10 níveis e encontre o covil do Deus. A jornada começa agora!`,
            "Aceitar a Missão"
        );
        this.saveGame();
    },

    explore() {
        window.audio.playClick();
        
        // Lógica de PROGRESSÃO LINEAR DE CHEFES: garante que você enfrenta todos de 10 em 10.
        let nextBossLvl = window.player.highestBossDefeated + 10;
        
        // Se o level do jogador for igual ou maior que o próximo boss, força o encontro da História!
        if (window.player.lvl >= nextBossLvl && window.bossesDB[nextBossLvl]) {
            window.ui.log(`🌩️ A HISTÓRIA AVANÇA! CHEFÃO LOCALIZADO!`, "dmg-taken"); 
            setTimeout(() => { window.combat.start(window.bossesDB[nextBossLvl], true, nextBossLvl); }, 1500); 
            return;
        }

        // Sistema aleatório de exploração comum
        const r = Math.random();
        
        if (r < 0.40) { // 40% Combate normal
            window.combat.start(window.bestiary[Math.floor(Math.random()*window.bestiary.length)], false);
        } 
        else if (r < 0.60) { // 20% Eventos Interativos (NPCs/História)
            window.ui.triggerEvent();
        } 
        else if (r < 0.85) { // 25% Achar Ouro
            const g = Math.floor(Math.random() * 20) + 5 + Math.floor(window.player.lvl * 2); window.player.gold += g;
            window.ui.log(`🌲 Achou ${g}💰 fuçando em corpos no chão.`, "loot"); window.ui.update(); this.saveGame();
        } 
        else { // 15% Achar Equipamentos
            const iRoll = Math.random(); let dropTemplate;
            if(iRoll < 0.33) dropTemplate = window.lootTables.weapons[Math.floor(Math.random() * window.lootTables.weapons.length)];
            else if(iRoll < 0.66) dropTemplate = window.lootTables.armors[Math.floor(Math.random() * window.lootTables.armors.length)];
            else dropTemplate = window.lootTables.offhands[Math.floor(Math.random() * window.lootTables.offhands.length)];
            
            let scaledStat = dropTemplate.stat + Math.floor(window.player.lvl / 2);
            let drop = { ...dropTemplate, stat: scaledStat };
            window.player.inventory.push(drop); window.ui.log(`🎁 Um baú antigo! Item: <b>${drop.name} (+${drop.stat})</b>!`, "skill");
            window.ui.update(); this.saveGame();
        }
    },

    rest() {
        window.audio.playClick(); let innPrice = 10;
        if (window.player.gold >= innPrice) {
            window.player.gold -= innPrice; window.player.hp = window.player.maxHp; window.player.mp = window.player.maxMp;
            window.ui.log(`🛌 Você alugou um quarto por ${innPrice}💰 e recuperou as energias para salvar a Princesa.`, "loot"); window.ui.update(); this.saveGame();
        } else { window.ui.log("❌ O estalajadeiro negou quarto. Ouro insuficiente."); }
    }
};

window.combat = {
    enemy: null, isBossFight: 0, 
    start(e, isBoss = false, bLvl = 0) {
        window.game.state = 'combat'; this.isBossFight = isBoss ? bLvl : 0;
        const scale = 1 + ((window.player.lvl - 1) * 0.25);
        this.enemy = { name: e.name, hp: Math.floor(e.baseHp * scale), maxHp: Math.floor(e.baseHp * scale), atk: Math.floor(e.baseAtk * scale), xp: Math.floor(e.baseXp * scale), gold: Math.floor(e.baseGold * scale), icon: e.icon, lvl: isBoss ? bLvl : window.player.lvl };
        
        document.getElementById('battle-arena').style.boxShadow = isBoss ? "inset 0 0 30px #b71c1c, 0 5px 15px rgba(0,0,0,0.8)" : "inset 0 0 30px #000, 0 5px 15px rgba(0,0,0,0.8)";
        document.getElementById('battle-arena').style.borderColor = isBoss ? "#ff5252" : "#444";
        window.ui.log(`⚠️ <b>${this.enemy.name} (Nvl ${this.enemy.lvl})</b> ataca!`, "dmg-taken");
        window.ui.toggleMode(true); window.ui.update();
    },
    attack() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        window.audio.playAttack(); window.ui.animate('player-portrait', 'anim-attack');
        const damage = window.player.atk + Math.floor(Math.random() * 8);
        this.processPlayerDamage(damage, `⚔️ <b>${damage}</b> dmg!`);
    },
    useSkill() {
        if (!this.enemy || this.enemy.hp <= 0) return;
        if (window.player.mp < window.player.classObj.skillCost) return window.ui.log("❌ Sem Mana / OOM", "dmg-taken");
        window.player.mp -= window.player.classObj.skillCost; window.ui.update();
        window.audio.playAttack(); window.ui.animate('player-portrait', 'anim-attack');
        const damage = Math.floor((window.player.atk * window.player.classObj.skillMult)) + Math.floor(Math.random() * 15);
        this.processPlayerDamage(damage, `✨ <b>${window.player.classObj.skillName}</b>: <b>${damage}</b> dmg!`, "skill");
    },
    processPlayerDamage(damage, logMsg) {
        this.enemy.hp -= damage; window.ui.log(logMsg, "dmg-dealt"); window.ui.animate('enemy-portrait', 'anim-shake'); window.ui.update();
        document.getElementById('combat-actions').style.pointerEvents = 'none';
        if (this.enemy.hp <= 0) setTimeout(() => this.win(), 800); else setTimeout(() => this.enemyTurn(), 1000);
    },
    enemyTurn() {
        if (!this.enemy || window.player.hp <= 0) return;
        window.ui.animate('enemy-portrait', 'anim-attack');
        let dodgeChance = Math.min(0.30, (window.player.dex + window.player.spd) / 1000);
        if(Math.random() < dodgeChance) {
            window.ui.log(`💨 Esquivou! / Dodged!`, "skill"); document.getElementById('combat-actions').style.pointerEvents = 'auto'; return;
        }
        const finalDamage = Math.max(1, (this.enemy.atk + Math.floor(Math.random() * 6)) - window.player.def); 
        window.player.hp -= finalDamage; window.audio.playGrunt();
        window.ui.log(`🩸 Inimigo ataca: <b>${finalDamage}</b> (Aparou/Def ${window.player.def}🛡️).`, "dmg-taken");
        window.ui.animate('player-portrait', 'anim-shake'); window.ui.update(); document.getElementById('combat-actions').style.pointerEvents = 'auto';
        if (window.player.hp <= 0) this.lose();
    },
    flee() {
        window.audio.playClick();
        if (this.isBossFight) return window.ui.log("❌ A vida da princesa depende disso, não ouse fugir!", "dmg-taken");
        let fleeChance = 0.4 + (window.player.spd / 200); 
        if (Math.random() < fleeChance) { window.ui.log("🏃 Bateu em retirada para as moitas!"); this.end(); } 
        else { window.ui.log("🏃 Tropeçou e falhou miseravelmente!", "dmg-taken"); document.getElementById('combat-actions').style.pointerEvents = 'none'; setTimeout(() => this.enemyTurn(), 800); }
    },
    win() {
        window.ui.log(`🏆 Vitória! +${this.enemy.gold}💰, +${this.enemy.xp} EXP.`, "loot");
        window.player.gold += this.enemy.gold; window.player.gainXp(this.enemy.xp); 
        
        if (this.isBossFight) {
            window.player.highestBossDefeated = this.isBossFight;
            let bossData = window.bossesDB[this.isBossFight];
            
            if (this.isBossFight === 150) {
                // Final do jogo
                window.ui.triggerPureStory(bossData.loreTitle, bossData.loreDesc, "Renacer (Apagar Save)", () => {
                    localStorage.removeItem('aethelgard_save'); location.reload();
                });
                return;
            } else {
                // Mostrar a Lore do Chefe derrotado
                window.ui.triggerPureStory(bossData.loreTitle, bossData.loreDesc, "A jornada continua");
            }
        }
        window.game.saveGame(); this.end();
    },
    lose() {
        window.ui.log(`💀 <b>MORTO. A princesa foi sacrificada.</b>`, "dmg-taken"); document.getElementById('combat-actions').style.display = 'none';
        localStorage.removeItem('aethelgard_save'); setTimeout(() => location.reload(), 5000);
    },
    end() { 
        window.game.state = 'explore'; this.enemy = null; this.isBossFight = 0; 
        document.getElementById('combat-actions').style.pointerEvents = 'auto'; document.getElementById('battle-arena').style.borderColor = "#444"; 
        document.getElementById('battle-arena').style.boxShadow = "inset 0 0 30px #000, 0 5px 15px rgba(0,0,0,0.8)";
        window.ui.toggleMode(false); window.ui.update(); 
    }
};

window.ui = {
    log(m, cls = "") { const c = document.getElementById('log-window'); const u = document.getElementById('game-log'); const l = document.createElement('li'); l.innerHTML = `> ${m}`; if(cls) l.className = cls; u.appendChild(l); setTimeout(() => { c.scrollTop = c.scrollHeight; }, 10); },
    update() {
        if(!window.player.classObj) return; 
        document.getElementById('hp').innerText = Math.max(0, window.player.hp); document.getElementById('max-hp').innerText = window.player.maxHp;
        document.getElementById('mp').innerText = window.player.mp; document.getElementById('max-mp').innerText = window.player.maxMp;
        document.getElementById('atk-val').innerText = window.player.atk; document.getElementById('def-val').innerText = window.player.def;
        document.getElementById('str-val').innerText = window.player.str; document.getElementById('spd-val').innerText = window.player.spd;
        document.getElementById('dex-val').innerText = window.player.dex; document.getElementById('cha-val').innerText = window.player.cha;
        document.getElementById('lvl').innerText = window.player.lvl; document.getElementById('gold').innerText = window.player.gold; document.getElementById('potions').innerText = window.player.potions;
        document.getElementById('hp-bar').style.width = `${Math.max(0, (window.player.hp / window.player.maxHp) * 100)}%`; document.getElementById('mp-bar').style.width = `${Math.max(0, (window.player.mp / window.player.maxMp) * 100)}%`; document.getElementById('xp-bar').style.width = `${window.player.lvl >= 150 ? 100 : Math.min(100, (window.player.xp / window.player.xpToNext) * 100)}%`;
        if (window.combat.enemy) { document.getElementById('enemy-name-display').innerText = window.combat.enemy.name; document.getElementById('enemy-art-icon').innerText = window.combat.enemy.icon; document.getElementById('enemy-hp-bar').style.width = `${Math.max(0, (window.combat.enemy.hp / window.combat.enemy.maxHp) * 100)}%`; }
    },
    updateInventoryModal() {
        const d = i18n[window.lang]; let eqHTML = "";
        if (window.player.equipped.weapon) eqHTML += `<li class="inv-item"><span>🗡️ ${window.player.equipped.weapon.name} <span style="color:#ffb300;">(+${window.player.equipped.weapon.stat} Atk)</span></span> <button class="inv-btn" onclick="window.player.unequip('weapon')">${d.unequip}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🗡️ ${d.empty}</li>`;
        if (window.player.equipped.offhand) eqHTML += `<li class="inv-item"><span>🎒 ${window.player.equipped.offhand.name} <span style="color:${window.player.equipped.offhand.adds==='atk'?'#ffb300':'#90caf9'};">(+${window.player.equipped.offhand.stat} ${window.player.equipped.offhand.adds==='atk'?'Atk':'Def'})</span></span> <button class="inv-btn" onclick="window.player.unequip('offhand')">${d.unequip}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🎒 ${d.empty}</li>`;
        if (window.player.equipped.armor) eqHTML += `<li class="inv-item"><span>🛡️ ${window.player.equipped.armor.name} <span style="color:#90caf9;">(+${window.player.equipped.armor.stat} Def)</span></span> <button class="inv-btn" onclick="window.player.unequip('armor')">${d.unequip}</button></li>`; else eqHTML += `<li class="inv-item" style="color:#777;">🛡️ ${d.empty}</li>`;
        document.getElementById('inv-equipped').innerHTML = eqHTML;
        let bagHTML = `<li class="inv-item"><span>🧪 Poção (x${window.player.potions})</span> <button class="inv-btn" onclick="window.player.usePotion()">${d.use}</button></li>`;
        window.player.inventory.forEach((item, index) => {
            let icon = item.type === 'weapon' ? '🗡️' : (item.type === 'armor' ? '🛡️' : '🎒');
            let statType = item.type === 'weapon' ? 'Atk' : (item.type === 'armor' ? 'Def' : (item.adds === 'atk' ? 'Atk' : 'Def'));
            bagHTML += `<li class="inv-item"><span>${icon} ${item.name} <span style="color:${statType==='Atk'?'#ffb300':'#90caf9'};">(+${item.stat} ${statType})</span></span> <div class="inv-btn-group"><button class="inv-btn btn-sell" onclick="window.player.sell(${index})">${d.sell}</button><button class="inv-btn" onclick="window.player.equip(${index})">${d.equip}</button></div></li>`;
        });
        document.getElementById('inv-bag').innerHTML = bagHTML;
    },
    
    // Função do Evento de História Dinâmico (NPCs)
    triggerEvent() {
        window.audio.playClick();
        const ev = window.events[Math.floor(Math.random() * window.events.length)];
        document.getElementById('event-title').innerText = ev.title;
        document.getElementById('event-desc').innerText = ev.desc;
        
        const choicesContainer = document.getElementById('event-choices');
        choicesContainer.innerHTML = '';
        
        ev.choices.forEach(choice => {
            let btn = document.createElement('button');
            btn.className = 'btn-medieval';
            btn.innerText = choice.text;
            btn.onclick = () => {
                window.audio.playClick();
                document.getElementById('event-modal').classList.add('hidden');
                choice.action();
                window.ui.update(); window.game.saveGame();
            };
            choicesContainer.appendChild(btn);
        });
        document.getElementById('event-modal').classList.remove('hidden');
    },

    // Função para popups narrativos sem escolhas complexas (Usado em Bosses e Intro)
    triggerPureStory(title, desc, btnText, callback = null) {
        document.getElementById('event-title').innerText = title;
        document.getElementById('event-desc').innerText = desc;
        
        const choicesContainer = document.getElementById('event-choices');
        choicesContainer.innerHTML = '';
        
        let btn = document.createElement('button');
        btn.className = 'btn-medieval';
        btn.innerText = btnText;
        btn.onclick = () => {
            window.audio.playClick();
            document.getElementById('event-modal').classList.add('hidden');
            if(callback) callback();
        };
        choicesContainer.appendChild(btn);
        document.getElementById('event-modal').classList.remove('hidden');
    },

    openInventory() { window.audio.playClick(); document.getElementById('inventory-modal').classList.remove('hidden'); this.updateInventoryModal(); },
    closeInventory() { window.audio.playClick(); document.getElementById('inventory-modal').classList.add('hidden'); },
    openSettings() { window.audio.playClick(); document.getElementById('settings-modal').classList.remove('hidden'); },
    closeSettings() { window.audio.playClick(); document.getElementById('settings-modal').classList.add('hidden'); },
    toggleMode(b) { document.getElementById('exploration-actions').classList.toggle('hidden', b); document.getElementById('combat-actions').classList.toggle('hidden', !b); document.getElementById('battle-arena').classList.toggle('hidden', !b); },
    animate(id, cls) { const el = document.getElementById(id); if(!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 350); }
};

window.onload = () => { 
    window.sys.setLang('pt'); 
    if(window.game.loadGame()) { document.getElementById('top-menu').classList.remove('hidden'); } 
    else { document.getElementById('class-selection-screen').classList.remove('hidden'); }
};
