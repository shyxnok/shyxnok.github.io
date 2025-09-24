console.log("%c Theme.ShyXnok v" + '0.0.1' + " %c https://github.com/shyxnok/hexo-theme-ShyXnok ", "color: white; background: rgb(12, 128, 230); padding:5px 0;", "padding:4px;border:1px solid rgb(12, 128, 230);");

window.init = null;
window.config = {
    color: ['#83559e', '#ff7512', '#cb54ff', '#ff9044', '#7678ff', '#34b1ff'],
    words: null,
    background: null,
    flf:null
}
async function loadword() {
    if (window.config.words) {
        return;
    }
    try {
        const res = await fetch('/yiyan.json');
        const bg = await fetch('/bg.json')
        const flf = await fetch('/flf.json')
        window.config.words = await res.json()
        window.config.background = await bg.json()
        window.config.flf = await flf.json()
        console.log('words已经加载')
    } catch {
        console.log('words加载失败')
    }
}
window.init = loadword()

function getrandom(items) {
    try {
        return items[Math.floor(Math.random() * items.length)]
    } catch {
        console.log('失败')
    }

}

async function getRandomWord() {
    await window.init;
    let wo = getrandom(window.config.words)
    let color = getrandom(window.config.color)
    const element = document.getElementById('hitokoto');
    if (element) {
        element.innerHTML = `<strong class="words" style='color:${color};'>${wo.word}</strong>
                        <p>来源《 ${wo.author} 》</p>`;
    }
}
async function setflf() {
    await window.init;
    let wo = window.config.flf
    let text=""
    for(let i=0;i<wo.length;i++){
        let bg=wo[i].replace('\.flf',"")
        text+=`<option value="${wo[i]}">${bg}</option>\n`
    }
        console.log(wo)
    const element = document.getElementById('font-style');
    if (element) {
        element.innerHTML = text;
    }
}

async function getbg() {
    await window.init;
    let bgss = getrandom(window.config.background)
    console.log(bgss)
    const element = document.getElementById('imgs');
    if (element) {
        element.innerHTML = `<img class="imgmove active" id = "slide" src="/img/background/${bgss}" loading="eager" decoding="async" fetchpriority="high">`;
    }
}
getRandomWord();
getbg()
setInterval("getbg()", 20000);
    setflf()
