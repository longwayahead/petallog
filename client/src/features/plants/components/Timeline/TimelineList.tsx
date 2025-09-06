// src/features/plants/components/Timeline/TimelineList.tsx
import InteractionCard from './InteractionCard';
import type { Interaction, Photo, Plant } from '../../../../types';

export default function TimelineList({
  items,
  editingId,
  onLongPress,
  onUpdateNote,
  textareaRefs,
  onDelete,
  onAddPhoto,
  onCardClick,
  onDoneEditing,
  onSelectPhoto,
  plant,
}: {
  items: Interaction[];
  editingId: string | null;
  onLongPress: (id: string) => void;
  onUpdateNote: (id: string, text: string) => void;
  textareaRefs: React.RefObject<Record<string, HTMLTextAreaElement | null>>;
  onDelete: (id: string) => void;
  onAddPhoto: (id: string) => void;
  onCardClick: (id: string) => void;
  onDoneEditing: () => void;
  onSelectPhoto: (p: Photo) => void;
  plant: Plant | null;
}) {
  return (
    <>
    {/* {console.log("Rendering timeline with items", items)} */}
      {items.map((item) => (
        <InteractionCard
          key={item.id}
          data={item}
          editing={editingId === item.id}
          onLongPress={() => onLongPress(item.id)}
          onUpdateNote={(txt) => onUpdateNote(item.id, txt)}
          inputRef={(el) => (textareaRefs.current[item.id] = el)}
          onDelete={() => onDelete(item.id)}
          onAddPhoto={() => onAddPhoto(item.id)}
          onSelectPhoto={(p) => onSelectPhoto(p)}
          onCardClick={() => {onCardClick(item.id)}}
          onDoneEditing={() => onDoneEditing()}
          plant={plant ? plant : null}
        />
      ))}
    </>
  );
}
