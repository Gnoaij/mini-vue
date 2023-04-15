function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children

  const oldLength = oldChildren.length
  const newLength = newChildren.length

  // 遍历oldChildren寻找可复用节点时遇到的最大index
  let lastIndex = 0

  // 遍历newChildren
  for (let i = 0; i < newLength; i++) {
    // 是否找到可复用节点
    let find = false

    const newVNode = newChildren[i]

    // 遍历oldChildren
    for (let j = 0; j < oldLength; j++) {
      const oldVNode = oldChildren[j]

      // 找到可复用节点
      if (newVNode.key === oldVNode.key) {
        find = true

        // 更新节点
        patch(oldVNode, newVNode, container)

        // 如果当前oldVNode的index小于lastIndex，需要移动节点
        // 否则不需要移动，更新lastIndex
        if (j < lastIndex) {
          const prevVNode = newChildren[i - 1]

          // 如果存在prevVNode，将节点移动到prevVNode之后
          // 否则为第一个节点，不需要移动
          if (prevVNode) {
            const anchor = prevVNode.el.nextSibling

            // 移动节点
            insert(newVNode.el, container, anchor)
          }
        } else {
          // 更新lastIndex
          lastIndex = j
        }

        break
      }
    }

    // 如果找不到可复用节点，挂载newVNode
    if (!find) {
      const prevVNode = newChildren[i - 1]
      const anchor = prevVNode ? prevVNode.el.nextSibling : container.firstChild

      // 挂载newVNode
      patch(null, newVNode, container, anchor)
    }
  }

  // 遍历oldChildren，卸载多余的oldVnode
  for (let i = 0; i < oldLength; i++) {
    const oldVNode = oldChildren[i]

    const has = newChildren.find((newVNode) => newVNode.key === oldVNode.key)

    if (!has) {
      // 卸载oldVNode
      unmount(oldVNode)
    }
  }
}
