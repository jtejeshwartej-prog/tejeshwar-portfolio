interface Orderable {
  id: string
  order: number
}

/**
 * Swaps the `order` value of the item at `index` with its neighbor in
 * `direction`, persists both via the given update function, and
 * returns the reordered array for optimistic local state.
 */
export async function swapOrder<T extends Orderable>(
  items: T[],
  index: number,
  direction: 'up' | 'down',
  update: (id: string, data: Partial<T>) => Promise<void>
): Promise<T[]> {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= items.length) return items

  const a = items[index]
  const b = items[targetIndex]
  const aOrder = a.order
  const bOrder = b.order

  await Promise.all([update(a.id, { order: bOrder } as Partial<T>), update(b.id, { order: aOrder } as Partial<T>)])

  const next = [...items]
  next[index] = { ...a, order: bOrder }
  next[targetIndex] = { ...b, order: aOrder }
  next.sort((x, y) => x.order - y.order)
  return next
}

export function nextOrderValue<T extends Orderable>(items: T[]): number {
  return items.length ? Math.max(...items.map((i) => i.order)) + 1 : 0
}
