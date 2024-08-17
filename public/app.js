(function () {
  const form = document.querySelector('form');
  const tbody = document.querySelector('tbody');

  form?.addEventListener('submit', handleSubmit);

  /** @param {Array<{ game: string, combinations: Array<number>, drawDate: string, jackpot: number, winners: number }>} results */
  function renderResults(results) {
    tbody.innerHTML = '';

    /** @type {Array<HTMLTableRowElement>} */
    const rows = [];

    for (const result of results) {
      const row = document.createElement('tr');

      // im too lazy to do it manually
      row.innerHTML = `
        <td>${result.game}</td>
        <td>${result.combinations.join('&#8209;')}</td>
        <td>${Intl.DateTimeFormat('en-US', {
          dateStyle: 'long',
        }).format(new Date(result.drawDate))}</td>
        <td>${new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
        }).format(result.jackpot)}</td>
        <td>${result.winners}</td>
      `;

      rows.push(row);
    }

    tbody.append(...rows);
  }

  /** @param {Event} e  */
  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(form);
    const from = formData.get('date-from') || undefined;
    const to = formData.get('date-to') || undefined;
    const games = formData.getAll('games');
    const body = {
      from,
      to,
      games: games.length < 1 ? undefined : games,
    };

    if (!from) {
      alert('date from is required');
      return;
    }

    try {
      const response = await fetch('/results', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if ('error' in json) {
        throw new Error(json?.message ?? 'an error occurs');
      }

      renderResults(json.data);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }
})();
