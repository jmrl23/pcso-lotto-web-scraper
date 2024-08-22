FROM node:20-alpine

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile
RUN yarn run build
RUN chmod +x /app/web

ENV NODE_ENV=production

ENTRYPOINT [ "/app/web" ]

CMD [ "." ]
