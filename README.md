# Хранилище кастомных скриптов
Дабы на форум грузить сжатую версию, а руками править жирненькую.

## В наличии:
- Уведомление при изменении инвентаря: https://github.com/AlluvioDev/scripts/tree/main/inventoryAlert
  Подключать в низ.
  БЕЗ СЖАТИЯ (проверен, гарантированно работает, но содержит много мусора (комментариев)):
  ```
	<!-- start Проверка наличия обновлений в поле "награды" ( https://github.com/AlluvioDev/scripts/tree/main#readme ) -->
		<script type="text/javascript" src="https://alluviodev.github.io/scripts/inventoryAlert/script.js"></script>
	<!-- end  Проверка наличия обновлений в поле "награды" -->
  ```
  СЖАТЫЙ (быстрее грузится, не проверялся отдельно):
  ```
	<!-- start Проверка наличия обновлений в поле "награды" ( https://github.com/AlluvioDev/scripts/tree/main#readme ) -->
		<script type="text/javascript" src="https://alluviodev.github.io/scripts/inventoryAlert/script_v2.13.min.js"></script>
	<!-- end  Проверка наличия обновлений в поле "награды" -->
  ```
- Код дайсов, учитывающих время написания поста, его id и прочие броски на странице: https://github.com/AlluvioDev/scripts/tree/main/dice#readme
