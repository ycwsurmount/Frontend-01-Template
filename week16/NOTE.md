# 每周总结可以写在这里

# 手势
## 手势的类型
- tap
- pan
- flick
- press
### tap
- 手往上一点，快速松开。  
- start之后快速end，tap
### pan
- 点完之后移动了10px,再松开手。慢拖拽
- panstart panmover panend
- start 0.5s,移动10px,就变成了panstart事件
panstart
### flick
- 点完之后快速移动，快速离开。快拖拽
### press
- 手长期按在屏幕上，再松开。
//press pressstart pressend
start 0.5s pressstart
pressstart end 变成press end
## 手势的转换
start ->end  (tap)

start ->(过了0.5秒) pressStart  ->(移动10px)panStart ->(move) pan ->(end) panEnd
panEnd ->(end,速度>?) flick
pressStart ->(end) pressend

start ->(过了0.5秒，且移动了10px) panStart -> (move) pan ->(end) panEnd
![手势图](./shoushitu.jpg)

## 关于系统手势
系统手势可以关掉
多指操作，多指操作一般是两指。两指操作一般会形成tansform,而且是有且仅有translate,rotate,scale。  
爽直手势，将三个手势有机组合在一起，变成matrix transform(矩阵)


## 手势监听
可以用touchEvent和mouseEvent来监听移动端和pc端上的不同的手势，当然也可以用PointerEvent，但是版本很新，兼容性可能会有问题。这里我们采用touchEvent和mouseEvent这种方案。
### touchEvent
- touch事件包含以下几个事件：
    touchstart、touchmove、touchend、touchcancel
    - touchend和touchcancel只会触发一个。
    比如系统事件进入，或者手势被判定为系统手势等，各种情况，都会触发touchcannel。  
    有时候屏幕上突然谈了个窗，比如alert,关闭弹窗时就会触发touchcancel。代码如下  
    ```
    let element = document.body;
    element.addEventListener("touchstart",event=>{
        console.log("start")
    })
    element.addEventListener("touchmove",event=>{
        console.log("move")
    })
    element.addEventListener("touchend",event=>{
        console.log("end")
    })
    element.addEventListener("touchcancel",event=>{
        console.log("cancel")
    })

    setTimeout(() => {
        alert(33333)
    }, 4000);
    ```

- touch事件的event包含以下一些重要的属性：
    - identifier
        1. touch对象的唯一标识符。
        2. 一次触摸动作在平面上移动的整个过程中（touchstart=>touchmove=>touchend或者touchstart=>touchmove=>touchcancel）该标识符不变。
        3. 可以用它来判断跟踪到的是否是同义次触摸过程。
    - screenX
        触点相对于屏幕左边元的x坐标
    - screenY
        触点相对于屏幕上边元的y坐标
    - clientX
        触点相对于可视区左边元的x坐标，不包括滚动偏移。
    - clientY
        触点相对于可视区上边元的y坐标，不包括滚动偏移。
    - pageX
        触点相对于HTML文档左边缘的x坐标，当存在水平滚动时，包含水平滚动的偏移。
    - pageY
        触点相对于HTML文档上边缘的y坐标，当存在水平滚动时，包含水平滚动的偏移。
    - changedTouches
        一个 TouchList 对象，包含了代表所有从上一次触摸事件到此次事件过程中，状态发生了改变的触点的 Touch 对象。
### mouseEvent
- mouse事件包含以下几个事件：
    - mousedown 鼠标按下
        事件在指针设备按钮按下时触发。
    - mouseup 鼠标抬起
        事件在指针设备（鼠标或者触摸板）按钮放开时触发。
    - mousemove 鼠标移动
        当指针设备（通常时鼠标）位于光标所在的热点内，将在该元素上触发该事件。  
        [有一个小例子](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event)
    - mouseover 鼠标悬停
        当使用指针设备（鼠标或者触摸板）将光标移动到元素或者子元素之一上，就触发了该事件
    - mouseout 鼠标移出
        当使用指针设备（鼠标或者触摸板）将光标移出到元素或者子元素之一上，就触发了该事件
    - mouseenter
        当使用指针设备（鼠标或者触摸板）将光标移动到元素上，就触发了该事件。它不会冒泡。
        指针从它的物理空间移动到它的子元素的物理空间上时不会触发
    - mouseleave
        当使用指针设备（鼠标或者触摸板）将光标移出到元素上，就触发了该事件。它不会冒泡。
        指针从它的子元素物理空间移动到它的物理空间上时不会触发
    - mouseover/mouseout 与 mouseenter/mouseleave的区别：
        - 如果一个元素没有子元素，那么该元素绑定mouseover/mouseout或者mouseenter/mouseleave两种事件效果没有区别，鼠标每次移入元素时都只会触发一次事件；
        - 如果绑定了mouseover/mouseout事件的元素存在子元素，那么，每次移入该元素时都会触发一次事件（包括从外部移入和从子元素移入），移入子元素时也会触发一次事件。会造成闪烁的效果
        - mouseenter/mouseleave DOM事件的行为与css的:hover伪类非常相似。
        - 总结：mouseenter/mouseleave不会冒泡到子元素上，mouseover/mouseout会冒泡到子元素上。
        [区别实例](https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseover_event)



## 派发事件
custom

## matrix
css动画不会用来做一个很复杂的动画，不好控制。  
matrix比较难解回来；  
translate、rotate、scale、 skew  
用矩阵来描述transform  
线性代数 矩阵  


