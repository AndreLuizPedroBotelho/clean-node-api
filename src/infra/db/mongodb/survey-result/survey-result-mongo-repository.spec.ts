import { SurveyModel } from '@/domain/models/survey'
import { Collection, ObjectId } from 'mongodb'
import { AccountModel } from '@/domain/models/account'
import { MongoHelper } from '../helpers'
import { SurveyResultMongoRepository } from './survey-result-mongo-repository'

let surveyCollection: Collection
let accountCollection: Collection
let surveyResultCollection: Collection

const makeAccount = async (): Promise<AccountModel> => {
  const res = await accountCollection.insertOne({
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  })

  return MongoHelper.map(res.ops[0])
}

const makeSurvey = async (): Promise<SurveyModel> => {
  const res = await surveyCollection.insertOne({
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    },
    {
      answer: 'any_answer'
    }],
    date: new Date()
  })

  return MongoHelper.map(res.ops[0])
}

const makeSurveyResult = async (account, survey): Promise<SurveyModel> => {
  const res = await surveyResultCollection.insertOne({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id),
    answer: survey.answers[0].answer,
    date: new Date()
  })

  return MongoHelper.map(res.ops[0])
}

const makeSurveyResultMongoRepository = (): SurveyResultMongoRepository => {
  return new SurveyResultMongoRepository()
}
describe('Survey Result Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyResultCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})

    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('save()', () => {
    test('Should add a survey if its new', async () => {
      const account = await makeAccount()
      const survey = await makeSurvey()

      const surveyMongoRepository = makeSurveyResultMongoRepository()

      const surveyResult = await surveyMongoRepository.save({
        accountId: account.id,
        surveyId: survey.id,
        answer: survey.answers[0].answer,
        date: new Date()
      })

      expect(surveyResult).toBeTruthy()
      expect(surveyResult.surveyId).toEqual(survey.id)
      expect(surveyResult.answers[0].answer).toBe(survey.answers[0].answer)
      expect(surveyResult.answers[0].count).toBe(1)
      expect(surveyResult.answers[0].percent).toBe(100)
    })
  })

  test('Should update survey result if its not new', async () => {
    const account = await makeAccount()
    const survey = await makeSurvey()

    await makeSurveyResult(account, survey)

    const surveyMongoRepository = makeSurveyResultMongoRepository()

    const surveyResult = await surveyMongoRepository.save({
      accountId: account.id,
      surveyId: survey.id,
      answer: survey.answers[1].answer,
      date: new Date()
    })

    expect(surveyResult).toBeTruthy()

    expect(surveyResult.surveyId).toEqual(survey.id)
    expect(surveyResult.answers[0].answer).toBe(survey.answers[0].answer)
    expect(surveyResult.answers[0].count).toBe(1)
    expect(surveyResult.answers[0].percent).toBe(100)
  })
})
