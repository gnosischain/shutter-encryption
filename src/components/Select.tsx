import { useCallback, useMemo } from 'react';
import { Select as NextUISelect, SelectItem, Avatar } from '@nextui-org/react';

type Item = any & {
  key: string;
  label: string;
  value: string | number;
  avatar?: string;
};

interface SelectProps {
  items: Item[];
  handleChange?: (item: Item) => void;
  selectedItem: Item;
  title: string;
}

export const Select = ({ items, handleChange, selectedItem, title }: SelectProps) => {
  const handleSelectionChange = useCallback((e: any) => {
    if (!e.target.value) return;

    const item = items.find((item) => item.key == e.target.value);

    handleChange?.(item);
  }, [items, handleChange]);

  const selectedKeys = useMemo(() => [selectedItem?.key], [selectedItem]);

  return (
    <NextUISelect
      items={items}
      value={selectedItem}
      selectedKeys={selectedKeys}
      onChange={handleSelectionChange}
      label={title}
      isDisabled={title == "Chain"}
      classNames={{
        label: 'group-data-[filled=true]:-translate-y-4 text-lg',
        trigger: 'min-h-16 focus:outline-none border-none',
        listboxWrapper: 'max-h-[400px]',
      }}
      listboxProps={{
        itemClasses: {
          base: [
            'rounded-md',
            'text-default-500',
            'transition-opacity',
            'data-[hover=true]:text-foreground',
            'data-[hover=true]:bg-default-100',
            'dark:data-[hover=true]:bg-default-50',
            'data-[selectable=true]:focus:bg-default-50',
            'data-[pressed=true]:opacity-70',
            'data-[focus-visible=true]:ring-default-500',
            'dark:data-[hover=true]:bg-default-50',
          ],
        },
      }}
      popoverProps={{
        classNames: {
          base: 'before:bg-default-200',
          content: 'p-0 border-small border-divider bg-background',
        },
      }}
      renderValue={(items) => {
        return items.map((item) => {
          return (
            <div key={item.key} className="flex items-center gap-2">
              {item.data.avatar && (
                <Avatar
                  alt={item.data.label}
                  className="flex-shrink-0"
                  size="sm"
                  src={item.data.avatar}
                />
              )}
              <div className="flex flex-col">
                <span>{item.data.label}</span>
                <span className="text-default-500 text-tiny">({item.data.value})</span>
              </div>
            </div>
          );
        });
      }}
    >
      {(item) => (
        <SelectItem key={item.key} textValue={item.label}>
          <div className="flex gap-2 items-center">
            <Avatar alt={item.label} className="flex-shrink-0" size="sm" src={item.avatar} />
            <div className="flex flex-col">
              <span className="text-small">{item.label}</span>
              <span className="text-tiny text-default-400">{item.value}</span>
            </div>
          </div>
        </SelectItem>
      )}
    </NextUISelect>
  );
};
