class CleanData {
  static trim(newData) {
    const cleaned = newData;

    Object.keys(cleaned).map((key) => {
      if (typeof cleaned[key] === 'string') {
        cleaned[key] = cleaned[key].trim();
      }
      if (cleaned[key] && typeof cleaned[key] === 'object'
        && cleaned[key].constructor === Array) {
        cleaned[key] = cleaned[key].map((item) => CleanData.trim(item));
      }
      if (cleaned[key] && typeof cleaned[key] === 'object'
        && cleaned[key].constructor === Object) {
        cleaned[key] = CleanData.trim(cleaned[key]);
      }
      return cleaned;
    });
    return cleaned;
  }
}

export default CleanData;
