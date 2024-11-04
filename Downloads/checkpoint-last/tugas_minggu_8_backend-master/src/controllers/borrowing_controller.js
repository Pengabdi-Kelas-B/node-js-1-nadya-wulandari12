const mongoose = require('mongoose');
const DB = require('../models');
const ResponseHelper = require('../utils/response');

class BorrowingController  {

  static async getAll(req, res) {
    try {

      // query params
      // kalo kirim, ada filter status
      // kalo kaga get semua

      // TRISULA EXPRESS JS
      // req.query dapetin query params yang (?status=ACTIVE)
      // req.params dapetin yang di endpoint misal /:id (req.params.id)
      // req.body dapeting yang dikirim via body


      const filter = {}

      if(req.query.status) {
        filter.status = req.query.status
      }

      const items = await DB.Borrowing.find(filter).populate('bookId', 'title description').populate('borrowerId', 'membershipId name');
      return ResponseHelper.success(res, items);
    } catch (error) {
      return ResponseHelper.error(res, error.message);
    }
  }

  static async getById(req, res) {
    try {
      const items = await DB.Borrowing.findById(req.params.id);
      return ResponseHelper.success(res, items);
    } catch (error) {
      return ResponseHelper.error(res, error.message);
    }
  }

  static async create(req, res) {
    const session = await mongoose.startSession()
    try {
      session.startTransaction()

      const book = await DB.Book.findById(req.body.bookId)
      const borrower = await DB.Borrower.findById(req.body.borrowerId)

      if(!book || !borrower) {
        return ResponseHelper.error(res, 'Book or Borrower Not Found', 400);
      }

      const createdBorrowingData = await DB.Borrowing.create(req.body);

      // update borrower
      borrower.borrowHistory.push(createdBorrowingData._id)

      await borrower.save()

      await session.commitTransaction()

      return ResponseHelper.success(res, createdBorrowingData);
    } catch (error) {
      await session.abortTransaction()

      return ResponseHelper.error(res, error.message);
    } finally {
      await session.endSession()
    }
  }

  static async update(req, res) {
    try {

      if(!req.params.id) {
        return ResponseHelper.error(res, 'ID not provided!', 400);
      }

      const items = await DB.Borrowing.findByIdAndUpdate(req.params.id, req.body);
      return ResponseHelper.success(res, items);
    } catch (error) {
      return ResponseHelper.error(res, error.message);
    }
  }

  static async delete(req, res) {
    try {
      
      if(!req.params.id) {
        return ResponseHelper.error(res, 'ID not provided!', 400);
      }

      const items = await DB.Borrowing.findByIdAndDelete(req.params.id);
      return ResponseHelper.success(res, items);
    } catch (error) {
      return ResponseHelper.error(res, error.message);
    }
  }

  static async return(req, res) {
    try {
      
      if(!req.body.id) {
        return ResponseHelper.error(res, 'ID not provided!', 400);
      }

      const item = await DB.Borrowing.findById(req.body.id);

      item.status = 'RETURNED'
      item.returnDate = new Date()

      await item.save()

      return ResponseHelper.success(res, item);
    } catch (error) {
      return ResponseHelper.error(res, error.message);
    }
  }
}

module.exports = BorrowingController