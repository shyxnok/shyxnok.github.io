const target = document.getElementById('toggle');

// 绑定点击事件，切换close类
target.addEventListener('click', function () {
    // 如果有close类则移除，没有则添加
    if (this.classList.contains('close')) {
        this.classList.remove('close');
    } else {
        this.classList.add('close');
    }
});
const theme = document.getElementById('theme')
// 绑定点击事件，切换close类
theme.addEventListener('click', function () {
    // 如果有close类则移除，没有则添加
    if (this.classList.contains('icon-sun')) {
        this.classList.remove('icon-sun');
        this.classList.add('icon-moon');
    } else {
        this.classList.add('icon-sun');
        this.classList.remove('icon-moon');
    }
});

const navbar =document.querySelector('.navbar')
let last=0;

window.addEventListener('scroll',
    function(){
        const cur=window.pageYOffset || document.documentElement.scrollTop;
        if(Math.abs(cur-last)>50){
            if(cur>last){
                navbar.classList.add('hidden')
                console.log("hidden")
            }else{
                navbar.classList.remove('hidden')
            }
            last=cur
        }
    }
)