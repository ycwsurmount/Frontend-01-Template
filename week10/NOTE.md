# W10-Geek-FE

### [Range-API](https://developer.mozilla.org/en-US/docs/Web/API/Range)

```html
<p>First paragraph.</p>
<p>Second paragraph.</p>
<p>Third paragraph.</p>
<p>Fourth paragraph.</p>

<script>
const paragraphs = document.querySelectorAll('p');

// Create new range
const range = new Range();

// Start range at second paragraph
range.setStartBefore(paragraphs[1]);

// End range at third paragraph
range.setEndAfter(paragraphs[2]);

// Get window selection
const selection = window.getSelection();

// Add range to window selection
selection.addRange(range);
</script>
```

强大的api



---

### 标准整理

Window下的API有800+个，经过整理。最后还剩下249个，whatwg标准中的基本都已经找出，还有很多web audio的标准，和svg的。

在找标准的过程中也发现，其实web的能力还是很强的，有一些api是对应一些具体的需求设计的，媒体的，视频的，游戏……都有。其实日常开发能用到的标准并不多，更多的是一些对于DOM操作的。