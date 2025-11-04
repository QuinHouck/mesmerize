export const isSelected = (itemId: string, selected: Pack | MapItem[] | null | undefined): boolean => {
    if(!Array.isArray(selected)){
        return selected?.id === itemId || false;
    } else {
        return selected.some((item) => item.id === itemId) || false;
    }
}