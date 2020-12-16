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
    test('Go on playlists page', async function(){
        await driver.get(url);
        let button = await driver.findElement(By.id('discover'));
        await button.click();
        let currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toBe(url+'homepage');
    });
    test('Create an account', async function(){
        await driver.get(url+'homepage');
        let loginButton = await driver.findElement(By.id('login'));
        await loginButton.click();
        let currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toBe(url+'login');
        let usernameField = await driver.findElement(By.name('signUpUsername'));
        await usernameField.click();
        await driver.sleep(1000);
        let user = 'TestUsername'+(Math.floor(Math.random()*Math.floor(10000))).toString();
        await usernameField.sendKeys(user);
        await driver.sleep(1000);
        let passwordField = await driver.findElement(By.name('signUpPassword'));
        await passwordField.clear();
        await passwordField.click();
        await passwordField.sendKeys('testPassword');
        let emailField = await driver.findElement(By.name('emailAddress'));
        await emailField.click();
        await emailField.clear();
        await emailField.sendKeys('testEmail@test.com');
        await driver.findElement(By.id('signUp')).click();
        await driver.sleep(1000);
        await driver.get(url+'homepage');
        let username = await driver.findElement(By.id('username')).getText();
        expect(username).toBe(user);
    });
});