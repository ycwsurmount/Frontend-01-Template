# 关于动画
    - css动画并不是可控的动画解决方案
        - case

            ```Javascript
                let el = document.getElementById('el');
                el.style.transition = 'ease 3s';
                
                function start() {
                    el.style.transform = 'translate(300px, 300px)';
                }

                function stop() {
                    el.style.transition = 'none';
                    el.style.transform = getComputedStyle(el).transform;
                }
            ```
    - 现在讲的是怎么停止css动画，并且让元素保留在当前运动的位置。
        - timeline
            - 同时控制多个动画
            - 提升性能
        - animation
            - 实现动画