const {Builder, By, Key, Util, until} = require('selenium-webdriver');
const script = require('jest');
const {beforeAll} = require('@jest/globals');
const { underscore } = require('consolidate');
require('chromedriver');
var userID;
var passwordID = 'testPassword';
var songsUrl = 'https://www.youtube.com/watch?v=WqRYBWyvbRo&ab_channel=EpitaphRecords, https://www.youtube.com/watch?v=MIajmLP46b4&ab_channel=UNFD, https://www.youtube.com/watch?v=SQNtGoM3FVU&ab_channel=NapalmRecords, https://www.youtube.com/watch?v=eH6tqXQNWUA&ab_channel=WhileSheSleepsVEVO'

const url = 'http://localhost:8080/';
jest.setTimeout(10000);

describe('EarStorm Tests', function(){
    let driver;
    
    beforeAll(async function(){
        driver = new Builder().forBrowser('chrome').build();
    } ,10000);

    afterAll(async function(){
        await driver.quit();
    }, 20000);

    test('Check title of the page', async function(){
        await driver.get(url);
        let title = await driver.getTitle();
        expect(title).toBe('EarStorm');
    });
    test('Go on playlists page', async function(){
        await driver.get(url);
        let button = await driver.findElement(By.id('discover'));
        await button.click();
        await driver.wait(until.urlContains("homepage"));
        let currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toBe(url+'homepage');
    });
    test('Create an account', async function(){
        await driver.get(url+'homepage');
        let loginButton = await driver.findElement(By.id('login'));
        await loginButton.click();
        await driver.wait(until.urlContains("login"));
        let currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toBe(url+'login');
        let usernameField = await driver.findElement(By.name('signUpUsername'));
        await usernameField.click();
        await driver.sleep(1000);
        let user = 'TestUsername'+(Math.floor(Math.random()*Math.floor(10000))).toString();
        userID = user;
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
        await driver.wait(until.urlContains("signup"));
        await driver.sleep(1000);
        await driver.get(url+'homepage');
        let username = await driver.findElement(By.id('username')).getText();
        expect(username).toBe(user);
    });
    test('Test de logout', async function(){
        let accountBtn = await driver.findElement(By.id('username'));
        await accountBtn.click();
        await driver.wait(until.urlContains("account"));
        let logoutBtn = await driver.findElement(By.id('logout'));
        await logoutBtn.click();
        await driver.get(url+'homepage');
        let username = await driver.findElement(By.id('username')).getText();
        expect(username.get).toBe(undefined);
    });
    test('Test login', async function(){
        let loginButton = await driver.findElement(By.id('login'));
        await loginButton.click();
        await driver.wait(until.urlContains("login"));
        let loginUsername = await driver.findElement(By.id('loginUsername'));
        let loginPassword = await driver.findElement(By.id('loginPassword'));
        let loginBtn = await driver.findElement(By.id('login'));
        await loginUsername.clear();
        await loginUsername.click();
        await driver.sleep(1000);
        await loginUsername.sendKeys(userID);
        await driver.sleep(1000);
        await loginPassword.clear();
        await loginPassword.click();
        await loginPassword.sendKeys(passwordID);
        await loginBtn.click();
        await driver.wait(until.urlContains("account"));
        expect(await driver.getCurrentUrl()).toBe(url+'account');
        await driver.get(url+'homepage');
        await driver.wait(until.urlContains("homepage"));
        let username = await driver.findElement(By.id('username')).getText();
        expect(username).toBe(userID);
    });
    test('Test create new Playlist', async function(){
        let accountBtn = await driver.findElement(By.id('username'));
        await accountBtn.click();
        await driver.wait(until.urlContains("account"));
        let createPlaylistBtn = await driver.findElement(By.id('btnCreatePl'));
        await driver.executeScript("arguments[0].click();", createPlaylistBtn);
        await driver.wait(until.urlContains("add_playlist"));
        let playlistNameField = await driver.findElement(By.name("playlist_name"));
        let songsUrlField = await driver.findElement(By.name("playlist_songs"));
        let metalCheckBox = await driver.findElement(By.id("metal"));
        let countryCheckBox = await driver.findElement(By.id("country"));
        let additionalGenresField = await driver.findElement(By.name("playlist_add_genre"));
        let descriptionField = await driver.findElement(By.name("playlist_descr"));
        let savePlaylistBtn = await driver.findElement(By.name('saveplaylist'));
        await playlistNameField.clear();
        await playlistNameField.click();
        await driver.sleep(1000);
        await playlistNameField.sendKeys('Playlist For JTest');
        await driver.sleep(1000);
        await songsUrlField.clear();
        await songsUrlField.click();
        await songsUrlField.sendKeys(songsUrl);
        await metalCheckBox.click();
        await countryCheckBox.click();
        await additionalGenresField.clear();
        await additionalGenresField.click();
        await additionalGenresField.sendKeys('AnotherGenre, OtherGenre');
        await descriptionField.clear();
        await descriptionField.click();
        await descriptionField.sendKeys('This is the description of the playlist');
        await savePlaylistBtn.click();
        await driver.wait(until.urlContains("account"));
        await expect(await driver.getCurrentUrl()).toBe(url+'account');
    });
    test('Playlist well added', async function(){
        await driver.get(url+'account');
        var tbody = await driver.findElement(By.id('tbody'));
        var addedPlaylist = await tbody.getText();
        addedPlaylist = await addedPlaylist.split(" ");
        let playlistName = addedPlaylist.slice(0,3).toString();
        let playlistDesciption = addedPlaylist.slice(3,10).toString();
        let creationDate = addedPlaylist.slice(10,13).toString();
        let modificationDate = addedPlaylist.slice(13,16).toString();
        expect(playlistName.replace(/,/g, " ")).toBe("Playlist For JTest");
        expect(playlistDesciption.replace(/,/g, " ")).toBe("This is the description of the playlist");
        expect(creationDate.replace(',', " ")).toBe(getFullDate(new Date()));
        expect(modificationDate.replace(',', " ")).toBe(getFullDate(new Date()));
    });
    test('Search Function', async function(){
        await driver.get(url+"homepage");
        await driver.wait(until.urlContains("homepage"));
        var searchField = await driver.findElement(By.name("search_words"));
        var input = ['description'];
        await searchField.clear();
        await searchField.click();
        await searchField.sendKeys(input[0]);
        var searchBtn = await driver.findElement(By.id('searchBtn'));
        await searchBtn.click();
        var tbody = await driver.findElement(By.id('tbody'));
        var playlists = await tbody.getText();
        expect(playlists).toContain(input[0]);
        input = "ugszidjzidgugfzzdhfzfz";
        var searchField = await driver.findElement(By.name("search_words"));
        await searchField.clear();
        await searchField.click();
        await searchField.sendKeys(input);
        var searchBtn = await driver.findElement(By.id('searchBtn'));
        await driver.sleep(1000);
        await searchBtn.click();
        var tbody = await driver.findElement(By.id('tbody'));
        playlists = await tbody.getText();
        expect(playlists).toBe("");
    });
});

function getFullDate(d) {
    let date = new Date(d);
    let months = ["January", "February", "March", "April", "May", "June", "July", "Augustus", "September", "October", "November", "December"]
    let fullDate = months[date.getMonth()] + " " + date.getDate() + ",,"+ date.getFullYear();
    return fullDate;
}