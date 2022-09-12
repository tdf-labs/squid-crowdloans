process: migrate
	@node -r dotenv/config lib/processor.js


build:
	@npm run build


serve:
	@npx squid-graphql-server


migrate:
	@npx squid-typeorm-migration apply


codegen:
	@npx squid-typeorm-codegen


typegen-kusama:
	@npx --yes squid-substrate-typegen typegenKusama.json
typegen-polkadot:
	@npx --yes squid-substrate-typegen typegenPolkadot.json

typegen: typegen-kusama typegen-polkadot

up:
	@docker-compose up -d

down:
	@docker-compose down

deploy: codegen typegen-$(network)
	@API_DEBUG=true npx sqd squid update crowdloans-$(network)@$(version) --source github.com/tdf-labs/squid-crowdloans.git#main -v -e NETWORK=$(network)

.PHONY: build serve process migrate codegen typegen up down
