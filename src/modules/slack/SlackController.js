class SlackController {
  static launch(req, res) {
    const response = 'Hi, I am Tembea.\nI can help you schedule trips.';

    return res.status(200).json({
      message: response
    });
  }
}

export default SlackController;
