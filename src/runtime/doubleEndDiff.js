function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children

  let oldStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newStartIndex = 0
  let newEndIndex = newChildren.length - 1

  let oldStartVNode = oldChildren[oldStartIndex]
  let oldEndVNode = oldChildren[oldEndIndex]
  let newStartVNode = newChildren[newStartIndex]
  let newEndVNode = newChildren[newEndIndex]

  // 双端遍历，更新并移动节点
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartIndex) {
      // 旧头部节点为undefined，说明已更新并移动，跳过该节点
      oldStartVNode = oldChildren[++oldStartIndex]
    } else if (!oldEndIndex) {
      // 旧尾部节点为undefined，说明已更新并移动，跳过该节点
      oldEndVNode = oldChildren[--oldEndIndex]
    } else if (oldStartVNode.key === newStartVNode.key) {
      // 头部节点可复用，更新节点，不需要移动
      patch(oldStartVNode, newStartVNode, container)

      oldStartVNode = oldChildren[++oldStartIndex]
      newStartVNode = newChildren[++newStartIndex]
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 尾部节点可复用，更新节点，不需要移动
      patch(oldEndVNode, newEndVNode, container)

      oldEndVNode = oldChildren[--oldEndIndex]
      newEndVNode = newChildren[--newEndIndex]
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 旧头部节点和新尾部节点可复用，更新节点，需要移动
      patch(oldStartVNode, newEndVNode, container)

      // 将节点移动到最后一位
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)

      oldStartVNode = oldChildren[++oldStartIndex]
      newEndVNode = newChildren[--newEndIndex]
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 旧尾部节点和新头部节点可复用，更新节点，需要移动
      patch(oldEndVNode, newStartVNode, container)

      // 将节点移动到第一位
      insert(oldEndVNode.el, container, oldStartVNode.el.nextSibling)

      oldEndVNode = oldChildren[--oldEndIndex]
      newStartVNode = newChildren[++newStartIndex]
    } else {
      // 双端遍历找不到可复用节点，遍历oldChildren，找到newStartVNode对应的oldVNode
      const IndexInOld = oldChildren.findIndex(
        (oldVNode) => oldVNode.key === newStartVNode.key
      )

      if (IndexInOld > 0) {
        // 如果找到，更新并移动节点
        const vnodeToMove = oldChildren[IndexInOld]

        patch(vnodeToMove, newStartVNode, container)

        // 将节点移动到第一位
        insert(vnodeToMove.el, container, oldStartVNode.el.nextSibling)

        // 节点已移动，设置为undefined
        oldChildren[IndexInOld] = undefined
      } else {
        // 否则挂载newStartVNode
        patch(null, newStartVNode, container, oldStartVNode.el)
      }
      newStartVNode = newChildren[++newStartIndex]
    }
  }

  // 双端遍历结束后，检查索引值
  if (oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex) {
    // 挂载剩余新节点
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const anchor = newChildren[newEndIndex + 1]
        ? newChildren[newEndIndex + 1].el
        : null

      patch(null, newChildren[i], container, anchor)
    }
  } else if (newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex) {
    // 卸载多余节点
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      unmount(oldChildren[i])
    }
  }
}
