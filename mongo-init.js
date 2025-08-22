// MongoDB initialization script
db = db.getSiblingDB('ai-lecturer');

// Create database user
db.createUser({
  user: 'ai-lecturer-user',
  pwd: 'ai-lecturer-password',
  roles: [
    {
      role: 'readWrite',
      db: 'ai-lecturer'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        }
      }
    }
  }
});

db.createCollection('lectures', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'owner', 'language'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        language: {
          bsonType: 'string',
          enum: ['english', 'russian', 'spanish', 'french', 'german', 'chinese', 'japanese']
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'username': 1 }, { unique: true });
db.lectures.createIndex({ 'owner': 1 });
db.lectures.createIndex({ 'status': 1 });
db.lectures.createIndex({ 'language': 1 });
db.lectures.createIndex({ 'isPublic': 1 });
db.lectures.createIndex({ 'createdAt': -1 });

print('AI Lecturer database initialized successfully!');
