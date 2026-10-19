import type { ReactNode } from 'react';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Flex, Typography } from 'antd';
import { GripVertical } from 'lucide-react';
import { tokens } from '@oxygen/config';

export type KanbanColumn = {
  id: string;
  title: string;
  subtitle?: string;
  count: number;
};

type Props<T extends { id: string }> = {
  columns: KanbanColumn[];
  items: T[];
  columnOf: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  // اسم المقبض لقارئ الشاشة ("اسحب فلان")
  dragLabel: (item: T) => string;
  // null = القراءة بس (من غير سحب)
  onMove: ((item: T, toColumnId: string) => void) | null;
  emptyText: string;
  ariaLabel: string;
};

function Card({
  id,
  handleLabel,
  draggable,
  children,
}: {
  id: string;
  handleLabel: string;
  draggable: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: !draggable,
    });
  return (
    <li
      ref={setNodeRef}
      style={{
        listStyle: 'none',
        background: tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        opacity: isDragging ? 0.6 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        position: 'relative',
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <Flex gap={8} align="flex-start">
        {draggable && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            aria-label={handleLabel}
            {...listeners}
            {...attributes}
            style={{
              cursor: 'grab',
              background: 'none',
              border: 0,
              padding: 2,
              color: tokens.color.mutedText,
              touchAction: 'none',
            }}
          >
            <GripVertical size={16} aria-hidden />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </Flex>
    </li>
  );
}

function Column({
  column,
  children,
  emptyText,
}: {
  column: KanbanColumn;
  children: ReactNode;
  emptyText: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <section
      ref={setNodeRef}
      aria-label={`${column.title} (${column.count})`}
      style={{
        flex: '0 0 280px',
        background: isOver ? tokens.color.mist : '#F3EFE6',
        borderRadius: 16,
        padding: 12,
        minHeight: 200,
      }}
    >
      <Flex justify="space-between" align="baseline" style={{ marginBottom: 4 }}>
        <Typography.Title level={2} style={{ fontSize: 15, margin: 0 }}>
          {column.title}
        </Typography.Title>
        <Typography.Text type="secondary">{column.count}</Typography.Text>
      </Flex>
      {column.subtitle && (
        <Typography.Text
          type="secondary"
          style={{ display: 'block', marginBottom: 8, fontSize: 12 }}
        >
          {column.subtitle}
        </Typography.Text>
      )}
      <ul style={{ margin: 0, padding: 0 }}>
        {children}
        {column.count === 0 && (
          <li
            style={{ listStyle: 'none', color: tokens.color.mutedText, fontSize: 13, padding: 8 }}
          >
            {emptyText}
          </li>
        )}
      </ul>
    </section>
  );
}

/**
 * لوحة Kanban مشتركة (برامج 5.2 · والـCRM 6.1): عمود لكل مرحلة، وكروت بتتسحب بالماوس من المقبض.
 * السحب للماوس بس؛ البديل للكيبورد وقارئ الشاشة (WCAG 2.5.7) بيحطه الكارت نفسه (اختيار "انقل إلى").
 * بتتفرّج على اللوحة نفسها بالـScroll الأفقي.
 */
export function KanbanBoard<T extends { id: string }>({
  columns,
  items,
  columnOf,
  renderCard,
  dragLabel,
  onMove,
  emptyText,
  ariaLabel,
}: Props<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    if (!onMove || !event.over) return;
    const item = items.find((entry) => entry.id === event.active.id);
    const target = String(event.over.id);
    if (item && columnOf(item) !== target) onMove(item, target);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        style={{ overflowX: 'auto', paddingBlockEnd: 8 }}
      >
        <Flex gap={12} align="flex-start" style={{ minWidth: 'max-content' }}>
          {columns.map((column) => (
            <Column key={column.id} column={column} emptyText={emptyText}>
              {items
                .filter((item) => columnOf(item) === column.id)
                .map((item) => (
                  <Card
                    key={item.id}
                    id={item.id}
                    handleLabel={dragLabel(item)}
                    draggable={onMove !== null}
                  >
                    {renderCard(item)}
                  </Card>
                ))}
            </Column>
          ))}
        </Flex>
      </div>
    </DndContext>
  );
}
