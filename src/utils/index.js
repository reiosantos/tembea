// import moment from 'moment';
// import fs from 'fs';
// import url from 'url';
// import fileSystem from 'fs-extra';
// import https from 'https';
// import http from 'http';
// import * as jwt from 'jsonwebtoken';
// import uuid from 'uuid/v4';
// import DateHelpers from '../helpers/dateHelper';
const moment = require('moment');
const fs = require('fs');
const fileSystem = require('fs-extra');
const https = require('https');
const http = require('http');
const jwt = require('jsonwebtoken');
const uuid = require('uuid/v4');
const url = require('url');
const DateHelpers = require('../helpers/dateHelper');

moment.updateLocale('en', {
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
});

class Utils {
  static toSentenceCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  static formatDate(dateStr) {
    const date = new Date(dateStr);
    return moment(date).format('ddd, MMM Do YYYY hh:mm a');
  }

  static getPreviousMonth() {
    return moment()
      .date(0)
      .format('MMM, YYYY');
  }

  static formatDateForDatabase(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const formattedDate = DateHelpers.changeDateFormat(dateStr);
    const date = new Date(formattedDate).getTime();
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  static nextAlphabet(firstChar) {
    const char = firstChar.toUpperCase();
    return String.fromCharCode(char.charCodeAt(0) + 1);
  }

  static writableToReadableStream(writableStream) {
    return fs.createReadStream(writableStream.path);
  }

  static removeHoursFromDate(noOfHours, date) {
    const rawDate = moment(date, 'DD/MM/YYYY HH:mm').subtract(
      noOfHours,
      'hours'
    );
    return rawDate.format('DD/MM/YYYY HH:mm');
  }

  static chunkArray(array, number) {
    if (!Array.isArray(array) || !array.length) {
      return [];
    }
    return [array.slice(0, number)].concat(
      this.chunkArray(array.slice(number), number)
    );
  }

  static convertMinutesToSeconds(minutes) {
    return 1000 * 60 * minutes;
  }

  static getNameFromEmail(fellowEmail) {
    if (!fellowEmail) return;
    let name;
    const email = fellowEmail.substring(0, fellowEmail.indexOf('@'));
    if (email.indexOf('.') !== -1) {
      const [firstName, lastName] = email.split('.');
      name = `${Utils.toSentenceCase(firstName)} ${Utils.toSentenceCase(lastName)}`;
    }
    return name;
  }

  /**
   * Convert working hours string from HH:mm - HH:mm to clock time object. eg: 20:30 - 01:30
   * is converted to { from: '08:30 pm', to: '01:30 am' }
   * @param {string} workHours
   * @return { {from:string, to:string} }
   */
  static formatWorkHours(workHours) {
    let [from, to] = workHours.split('-');
    from = moment(from.trim(), 'HH:mm')
      .format('LT');
    to = moment(to.trim(), 'HH:mm')
      .format('LT');
    return {
      from,
      to
    };
  }

  static formatTime(time) {
    return moment(time.trim(), 'HH:mm')
      .format('LT');
  }

  static async verifyToken(token, envSecret) {
    const secret = process.env[envSecret];
    try {
      const decodedData = await jwt.verify(token, secret);
      return decodedData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @static generateToken
   * @description This function generates and encrypts JWT token
   * @param  {integer} time
   * @param  {object} payload
   * @returns {string} encrypted JWT token
   */
  static generateToken(time, payload) {
    const secret = process.env.JWT_TEMBEA_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: time });
    return token;
  }

  static mapThroughArrayOfObjectsByKey(array, key) {
    if (array.length < 1) {
      return [];
    }
    return array.map(item => item[key]);
  }

  static formatUserInfo(user, unfilteredRoles) {
    const roleNames = Utils.mapThroughArrayOfObjectsByKey(unfilteredRoles, 'name');
    const {
      id, name, slackId, phoneNo, email
    } = { ...user.dataValues };

    const userInfo = {
      id,
      name,
      slackId,
      phoneNo,
      email,
      roles: roleNames
    };
    return userInfo;
  }

  /**
    * @static convertToImageAndSaveToLocal
    * @description This function convert the google map image url into a jpeg file
    * @param  {string} uri of the google map image url
    * @param  {string} destination - location to save the image
    * @param  {string} filename - the name of the new jpeg image file
    * @returns {string} Save.
    */
  static convertToImageAndSaveToLocal(uri, destination) {
    const theUrl = url.parse(uri);
    if (!theUrl.host) throw new Error('Requested URL is invalid');
    const client = (theUrl.protocol === 'https:') ? https : http;
    Utils.createDirectory(destination);
    const filename = uuid();
    return new Promise((resolve, reject) => {
      const fileDir = `${destination}/${filename}`;
      const file = fs.createWriteStream(fileDir);
      client.get(uri, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            resolve(file.path);
          });
        });
      }).on('error', (err) => {
        fs.unlink(fileDir, () => {});
        reject(err);
      });
    });
  }

  /**
    * @static createDirectory
    * @description This function create directory to store dowloaded files
    * @param  {string} filePath the file directory to create
    * @returns {void}.
  */
  static createDirectory(filePath) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
  }

  static async removeFile(fileDir) {
    try {
      await fileSystem.unlink(fileDir);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Utils;
