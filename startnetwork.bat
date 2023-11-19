@echo off

set DATA_PATH=./network

set /p PUBLIC_KEY=<./network/etherbase.txt

rem Запуск geth
geth --datadir "%DATA_PATH%" --networkid 1547 --http --http.corsdomain "*" --http.api "admin,personal,eth,net,web3,txpool,miner" --allow-insecure-unlock --unlock "%PUBLIC_KEY%" --password "./network/pass.txt" --mine --snapshot=false --miner.etherbase "%PUBLIC_KEY%"


