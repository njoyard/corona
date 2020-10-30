export default function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\W/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}
