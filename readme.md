# pcso lotto web scraper

get lotto results

## sample usage

```ts
const lottoScrapper = new LottoScrapper();
const results = await lottoScrapper.get({
  from: 'August 1 2024',
});

console.log(results);
```

## types

```ts
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
```
