const {Builder, By, Key, Util} = require('selenium-webdriver');
const script = require('jest');
const {beforeAll} = require('@jest/globals');
require('chromedriver');


const url = 'http://localhost:8080/';

describe('Tests on EarStorm', function(){
    let driver;
    
    beforeAll(async function(){
        driver = new Builder().forBrowser('chrome').build();
    } ,10000);

    afterAll(async function(){
        await driver.quit();
    }, 15000);

    test('Check title of the page', async function(){
        await driver.get(url);
        let title = await driver.getTitle();
        expect(title).toBe('EarStorm');
    });
});