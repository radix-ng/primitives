export function handleCalendarInitialFocus(calendar: HTMLElement) {
    const selectedDay = calendar.querySelector<HTMLElement>('[data-selected]');
    if (selectedDay) return selectedDay.focus();

    const today = calendar.querySelector<HTMLElement>('[data-today]');
    if (today) return today.focus();

    const firstDay = calendar.querySelector<HTMLElement>('[data-rdx-calendar-day]');
    if (firstDay) return firstDay.focus();
}
