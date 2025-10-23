simple library mock system using:
- mongoDB
- Nodejs
- Expressjs
- React (Material UI)

**MODELS**
1. User
    - username
        -> String
    - email
        -> String
    - password (hashed, via jwt)
        -> String
2. Book
    - title
        -> String
    - coverImg
        -> String
    - details
        -> String
    - genres
        -> String
    - rating
        -> Number
3. Borrow
    - userId
        -> String
    - bookId
        -> String
    - borrowedAt
        -> Date
    - dueDate
        -> Date
    - returnedAt
        -> Date
    - status
        -> enum["active", "overdue", "returned"]
    - renew (max renewals per user)
        -> Number

