# week03总结可以写在这里

javascript

-Atom
-Expressions  --Grammar
                Tree vs Priority： +-；*/；()
                从上到下优先级：成员变量Member->new->call

              --运行时

.Left Handside & Right Handside
-语句
 
 -- Grammar
 简单语句
    ExpressionStatement表达式语句
    EmptyStatement空语句
    DebuggerStatement
    ThrowStatement
    ContinueStatement
    BreakStatement
    ReturnStatement
 组合语句
    BlockStatement
    Iteration循环语句： while/do while/for/for in/for of/for await(of)
 声明
 -- 运行时
 Completion Record   [[type]]: normal，break,continue,return,or throw
                     [[value]]: Types
                     [[target]]: label

**************************************************************************

1. js浮点数问题

```js
function check(zero){
	if(1/zero === Infinity){
		return 1;
	}
	if(1/zero === -Infinity){
		return -1;
	}
}
function sign(number){
	return number / Math.abs(number);
}
```

2. js标准中有些对象是我们无法实现的， 都有一些特点

-Function Object
   [[call]] 视为函数Function
   [[Construct]] 可以被new 操作符调用，根据new的规则返回对象。
-Array Object
   [[DefineOwnProperty]]
   Property == length 设置对象的length属性，根据length的变化对对象进行操作
   newLength > length 用空扩充数组
   newLength < length 截取数组
-String Object
  string的length是不可写不可配的。

-Arguments Object
  [[callee]] 视为函数参数对对象，伪数组 caller

-Object
  [[Get]] property被访问时调用 get
  [[Set]] property被赋值时调用 set
  [[GetPrototypeOf]] 对应getPrototypeOf方法 获取对象原型
  [[SetPrototypeOf]] 对应setPrototypeOf方法 设置对象原型
  [[GetOwnProperty]] getOwnPropertyDescriptor 获取对象私有属性的描述列表
  [[HasProperty]] hasOwnProperty 私有属性判断
  [[IsExtensible]] isExtensible对象是否可扩展
  [[PreventExtensions]] preventExtension控制对象是否可以添加属性
  [[DefineOwnProperty]] defineProperty 定义对象属性
  [[Delete]] delete 操作符
  [[OwnPropertyKeys]] Object.keys() Object.entries() Object.values()
  [[Call]] 能够调用call

-Module Namespece
  [[Module]] 视为一个引入的模块
  [[Exports]] 视为一个导出的模块
 

