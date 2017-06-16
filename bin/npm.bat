if "%1"=="test" goto TEST

docker-compose -f docker-compose-tools.yml run --rm npm %*

goto DONE

:TEST
docker-compose -f docker-compose-test.yml up -d db-test
docker-compose -f docker-compose-tools.yml run --rm mocha test/bootstrap.test.js test/integration/bootstrap.test.js test/**/*.test.js

:DONE