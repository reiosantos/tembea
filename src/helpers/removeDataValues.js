class RemoveDataValues {
  static removeDataValues(newData) {
    let sorted = newData;
    if (sorted.dataValues) {
      sorted = sorted.dataValues;
    }

    Object.keys(sorted).map((key) => {
      if (sorted[key] && sorted[key].dataValues) {
        sorted[key] = sorted[key].dataValues;
        const data = RemoveDataValues.removeDataValues(sorted[key]);
        sorted[key] = data;
      } else if (sorted[key]) {
        sorted[key] = sorted[key];
      }
      return sorted;
    });
    return sorted;
  }
}

export default RemoveDataValues;
