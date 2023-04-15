function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children

  let j = 0
  let oldEnd = oldChildren.length - 1
  let newEnd = newChildren.length - 1

  let oldVNode = oldChildren[j]
  let newVNode = newChildren[j]

  // 更新前置节点
  while (oldVNode && newVNode && oldVNode.key === newVNode.key) {
    patch(oldVNode, newVNode, container)

    j++
    oldVNode = oldChildren[j]
    newVNode = newChildren[j]
  }

  oldVNode = oldChildren[oldEnd]
  newVNode = newChildren[newEnd]

  // 更新后置节点
  while (oldVNode && newVNode && oldVNode.key === newVNode.key) {
    patch(oldVNode, newVNode, container)

    oldVNode = oldChildren[--oldEnd]
    newVNode = newChildren[--newEnd]
  }

  // 前置节点和后置节点更新结束，检查索引值
  if (j > oldEnd && j <= newEnd) {
    // 旧节点处理完而新节点有剩余，挂载剩余新节点
    const anchorIndex = newEnd + 1
    const anchor =
      anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null

    while (j <= newEnd) {
      patch(null, newChildren[j++], container, anchor)
    }
  } else if (j > newEnd && j <= oldEnd) {
    // 新节点处理完而旧节点有剩余，卸载多余旧节点
    while (j <= oldEnd) {
      unmount(oldChildren[j++])
    }
  } else if (j <= oldEnd && j <= newEnd) {
    // 新旧节点都有剩余
    // 剩余未处理的新节点个数
    const count = newEnd - j + 1
    // 新节点对应旧节点的index，初始填充-1
    const source = new Array(count).fill(-1)
    // 新节点key对应的index
    const keyIndex = []

    const oldStart = j
    const newStart = j

    // 是否需要移动
    let moved = false
    // 遍历旧节点寻找可复用节点时遇到的最大index
    let pos = 0
    // 已处理的节点数量
    let patched = 0

    // 遍历新节点，填充keyIndex
    for (let i = newStart; i <= newEnd; i++) {
      keyIndex[newChildren[i].key] = i
    }

    // 遍历旧节点
    for (let i = oldStart; i <= oldEnd; i++) {
      oldVNode = oldChildren[i]

      if (patched < count) {
        // 根据旧节点的key找到对应的新节点的index
        let k = keyIndex[oldVNode.key]

        if (k !== undefined) {
          // 如果index存在，说明节点可复用
          newVNode = newChildren[k]

          // 更新节点
          patch(oldVNode, newVNode, container)

          // 填充source
          source[k - newStart] = i

          // 每更新一个节点，patched++
          patched++

          if (k < pos) {
            // 需要移动，设置moved
            moved = true
          } else {
            // 不需要移动，更新pos
            pos = k
          }
        } else {
          // 卸载多余的旧节点
          unmount(oldVNode)
        }
      } else {
        // 已更新的节点大于等于需要更新的节点，卸载多余的旧节点
        unmount(oldVNode)
      }
    }

    if (moved) {
      // 计算最长递增子序列，元素值为对应节点在source中的索引值
      const seq = lis(source)

      // s指向最长递增子序列最后一个元素
      let s = seq.length - 1
      // i指向新节点的最后一个元素
      let i = count - 1

      // 从后遍历新节点
      for (i; i > 0; i--) {
        if (source[i] === -1) {
          // 说明该节点为全新的节点
          const pos = i + newStart
          const newVNode = newChildren[pos]
          const nextPos = pos + 1
          const anchor =
            nextPos < newChildren.length ? newChildren[nextPos].el : null

          // 挂载节点
          patch(null, newVNode, container, anchor)
        } else if (i !== seq[s]) {
          // 说明该节点不是最长递增子序列中对应的节点，需要移动
          const pos = i + newStart
          const newVNode = newChildren[pos]
          const nextPos = pos + 1
          const anchor =
            nextPos < newChildren.length ? newChildren[nextPos].el : null

          // 移动节点
          insert(newVNode, container, anchor)
        } else {
          // 不需要移动
          s--
        }
      }
    }
  }
}
