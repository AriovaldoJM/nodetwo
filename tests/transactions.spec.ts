import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'


describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback -- --all')
    execSync('npm run knex migrate:latest')
  })

  
  it('o usuário consegue listar uma nova operação', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })
      .expect(201)
  })
  
  it('should be able to list all transaction', async () => {
    const createTransactonResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })

      const cookies = createTransactonResponse.get('Set-Cookie')
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies ?? [])
        .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
          expect.objectContaining({
            title: 'New transaction',
            amount: 5000,
          })
        ])
  })

  it('should be able to get a especific transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })
      .expect(201)
  })

  it('o usuário consegue listar uma nova operação', async () => {
    const createTransactonResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit'
      })

      const cookies = createTransactonResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies ?? [])
      .expect(200)

      const transactionId = listTransactionsResponse.body.transactions[0].id 

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies ?? [])
      .expect(200)

      expect(getTransactionResponse.body.transaction).toEqual(
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        })
      )
  })
  it('should be able to get to summary', async () => {
    const createTransactonResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit'
      })

      const cookies = createTransactonResponse.get('Set-Cookie')

      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies ?? [])
        .send({
          title: 'Debit transaction',
          amount: 2000,
          type: 'debit'
      })

      const summaryResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies ?? [])
        .expect(200)

        expect(summaryResponse.body.summary).toEqual({
          amount: 3000,
        })
  })

})
