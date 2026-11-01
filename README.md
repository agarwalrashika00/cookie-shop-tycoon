# Kevin's Cookie Shop Tycoon

Open **index.html** in a modern web browser. No installation, build, or server required. The game works offline; the optional Google Fonts stylesheet falls back to system fonts.

Start with $100 and run a cookie shop for 30 days. Choose a cookie variety, batch size, cookie price, and advertising budget, then select **Bake & open shop** to finish the day. Review the results and adjust tomorrow's plan. Your game saves automatically when browser storage is available.

- Choose one daily specialty: chocolate chip ($0.50 ingredients, suggested $2.00 selling price), oatmeal raisin ($0.35 ingredients, suggested $1.75), or double chocolate ($0.80 ingredients, suggested $2.75). Set your own price for each variety; the game remembers each price and your selected specialty.
- Chocolate chip has the broadest audience. Oatmeal raisin has cheaper ingredients and slightly lower demand; double chocolate supports a higher price but attracts a smaller premium audience. Advertising costs your chosen budget, and shop costs are $5 per day.
- Results and the ledger identify the variety baked each day. Existing saved games remain playable and their old batches are treated as chocolate chip.
- Pay all expenses up front: you cannot spend more cash than you have.
- Higher prices reduce demand. Advertising increases demand with diminishing returns. The daily forecast and small random variations affect traffic.
- Unsold cookies are discarded at the end of each day.
- The game ends after day 30, or early if you have less than $5 to open the shop. There are no loans.
- **New game** lets you reset after a confirmation.
- Opening each day plays a short animated customer rush. More cookies sold means more visitors (up to 18 animated visitors, representing groups on busy days). The sales counter tracks their purchases. Use **Skip animation** to jump to the final count; reduced-motion preferences skip it automatically.

For a local server, if Node.js is installed, run `node server.cjs` and visit http://localhost:4173.
