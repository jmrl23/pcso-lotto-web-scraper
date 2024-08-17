import { DOMWindow } from 'jsdom';
import { JSDOM } from 'jsdom';
import qs from 'qs';

interface Payload {
  from: string;
  to?: string;
  filter?(result: Result): boolean;
}

interface Result {
  game: Game;
  combinations: number[];
  drawDate: Date;
  jackpot: number;
  winners: number;
}

type Game =
  | 'Ultra Lotto 6/58'
  | 'Grand Lotto 6/55'
  | 'Superlotto 6/49'
  | 'Megalotto 6/45'
  | 'Lotto 6/42'
  | '6D Lotto'
  | '4D Lotto'
  | '3D Lotto 2PM'
  | '3D Lotto 5PM'
  | '3D Lotto 9PM'
  | '2D Lotto 2PM'
  | '2D Lotto 5PM'
  | '3D Lotto 9PM';

export default class LottoScrapper {
  constructor(
    private readonly url: string = 'https://www.pcso.gov.ph/SearchLottoResult.aspx',
    private readonly headers: Record<string, string> = {
      origin: 'https://www.pcso.gov.ph',
      referer: 'https://www.pcso.gov.ph/SearchLottoResult.aspx',
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
    },
  ) {}

  public async get(payload: Payload): Promise<Array<any>> {
    const initialDomWindow = await this.getInitialDomWindow();
    if (!initialDomWindow) return [];

    const resultDomWindow = await this.getResultDomWindow(
      initialDomWindow,
      new Date(payload.from),
      payload.to ? new Date(payload.to) : undefined,
    );
    if (!resultDomWindow) return [];

    const results = this.extractResults(resultDomWindow, payload);
    return results;
  }

  private extractResults(
    domWindow: DOMWindow,
    payload: Omit<Payload, 'from' | 'to'>,
  ): Result[] {
    const tbody =
      domWindow.document.querySelector<HTMLTableSectionElement>(
        'table > tbody',
      );
    const rows = Array.from(
      tbody?.querySelectorAll<HTMLTableRowElement>('tr') ?? [],
    );
    const rawData = rows
      .map((row) => {
        const cells = Array.from(
          row.querySelectorAll<HTMLTableCellElement>('td') ?? [],
        );
        const raw = cells.map((cell) => cell.textContent?.trim());
        return raw;
      })
      .filter((data) => data.length === 5);
    const results: Result[] = rawData
      .map((data) => ({
        game: data.at(0)! as Game,
        combinations: data
          .at(1)!
          .split('-')!
          .map((n) => parseInt(n)),
        drawDate: new Date(data.at(2)!),
        jackpot: parseFloat(data.at(3)!.replace(/,/g, '')),
        winners: parseInt(data.at(4)!),
      }))
      .filter((result) => (payload.filter ? payload.filter(result) : true));

    return results;
  }

  private async getDomWindow(
    request: Promise<Response>,
  ): Promise<DOMWindow | null> {
    try {
      const response = await request;
      const html = await response.text();
      const jsDom = new JSDOM(html);
      const domWindow = jsDom.window;
      return domWindow;
    } catch (error) {
      return null;
    }
  }

  private async getResultDomWindow(
    initialDomWindow: DOMWindow,
    from: Date,
    to: Date = new Date(),
  ): Promise<DOMWindow | null> {
    const state = {
      __VIEWSTATE:
        initialDomWindow.document.querySelector<HTMLInputElement>(
          '#__VIEWSTATE',
        )!.value,
      __VIEWSTATEGENERATOR:
        initialDomWindow.document.querySelector<HTMLInputElement>(
          '#__VIEWSTATEGENERATOR',
        )!.value,
      __EVENTVALIDATION:
        initialDomWindow.document.querySelector<HTMLInputElement>(
          '#__EVENTVALIDATION',
        )!.value,
    };
    const formBody = this.createFormBody(state, from, to);
    const domWindow = await this.getDomWindow(
      fetch(this.url, {
        method: 'POST',
        headers: {
          ...this.headers,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      }),
    );
    return domWindow;
  }

  private createFormBody(
    state: Record<string, string>,
    from: Date,
    to: Date,
  ): string {
    const [fromMonth, fromDate, fromYear] = Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
    })
      .format(from)
      .replace(',', '')
      .split(' ');
    const [toMonth, toDate, toYear] = Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
    })
      .format(to)
      .replace(',', '')
      .split(' ');

    const body = qs.stringify({
      ...state,
      ctl00$ctl00$cphContainer$cpContent$ddlStartMonth: fromMonth,
      ctl00$ctl00$cphContainer$cpContent$ddlStartDate: fromDate,
      $ctl00$cphContainer$cpContent$ddlStartYear: fromYear,
      ctl00$ctl00$cphContainer$cpContent$ddlEndMonth: toMonth,
      ctl00$ctl00$cphContainer$cpContent$ddlEndDay: toDate,
      ctl00$ctl00$cphContainer$cpContent$ddlEndYear: toYear,
      ctl00$ctl00$cphContainer$cpContent$ddlSelectGame: 0,
      ctl00$ctl00$cphContainer$cpContent$btnSearch: 'Search Lotto',
    });

    return body;
  }

  private async getInitialDomWindow(): Promise<DOMWindow | null> {
    const domWindow = await this.getDomWindow(
      fetch(this.url, {
        headers: this.headers,
      }),
    );
    return domWindow;
  }
}
