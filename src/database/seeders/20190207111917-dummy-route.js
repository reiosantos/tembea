module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Routes', [
    {
      name: 'Thika',
      imageUrl: 'https://images.pexels.com/photos/21014/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=2&w=500',
      destinationId: 1,
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    },
    {
      name: 'Qwetu',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq_HWgV4xfdFUpfyzdyEzFbpMmjQpVfTNwiKMyCnRIq8o4_FUTHQ',
      destinationId: 2,
      createdAt: '2019-01-22 22:59:23.326000',
      updatedAt: '2019-01-22 22:59:23.326000'
    }
  ]),

  down: queryInterface => queryInterface.bulkDelete('Routes', null, {})
};
