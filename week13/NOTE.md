# Range

表示一个包含节点与文本节点的一部分的文档片段。  

1. setStart|setEnd  
    ```
    range.setStart(startNode,startOffset)
    ```
    startNode类型是Text|Comment|CDATASection，startOffset指字符的偏移量。对于其他Node类型节点，表示子节点的偏移量。

2. selectNode  
    将range设置为包含整改Node及其内容.
    ```
    var range = document.createRange();
    var referenceNode = document.getElementById("box");
    range.selectNode(referenceNode)

    ```

3. cloneRange  
    克隆一个range
    ```
    var range = document.createRange();
    range.selectNode(document.getElementById("box"));
    var clone = range.cloneRange();

    ```
4. insertNode  
    在range的起始位置插入节点的方法
    ```
    var range = document.createRange();
    var newNode = document.createElement("p");
    newNode.appendChild(document.createTextNode("New Node Inserted Here"));
    range.selectNode(document.getElementsByTagName("div").item(0));
    range.insertNode(newNode);

    ```
5. deleteContent  
    移除来自Document的Range内容
    ```
    var range = document.createRange();
    range.selectNode(document.getElementsByTagName("div").item(0));
    range.deleteContents();

    ```