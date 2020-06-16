import React, { useEffect } from 'react'
import Link from 'next/link'
import { NextPage } from 'next'
import { TaxForm } from '../types/TaxForm'
import { getRoutes, validateRoute } from '../lib/routes'
import { TaxFormUserInput } from '../types/TaxFormUserInput'
import { useRouter } from 'next/router'
import { FormErrors, TaxBonusUserInput } from '../types/PageUserInputs'
import { Form, FormikProps } from 'formik'
import { ErrorSummary } from '../components/ErrorSummary'
import { BooleanRadio, FormWrapper, Input } from '../components/FormComponents'
import {
  formatIban,
  validateIbanCountry,
  validateIbanFormat,
} from '../lib/utils'

const { previousRoute, nextRoute } = getRoutes('/iban')

interface Props {
  taxForm: TaxForm
  taxFormUserInput: TaxFormUserInput
  setTaxFormUserInput: (input: Partial<TaxFormUserInput>) => void
}
const Iban: NextPage<Props> = ({
  taxForm,
  taxFormUserInput,
  setTaxFormUserInput,
}: Props) => {
  const router = useRouter()

  useEffect(() => {
    router.prefetch(nextRoute())
    validateRoute(router, taxFormUserInput)
  }, [router, taxFormUserInput])

  return (
    <>
      <Link href={previousRoute()}>
        <a className="govuk-back-link" data-test="back">
          Späť
        </a>
      </Link>
      {!taxForm.mozeZiadatVratitDanovyBonusAleboPreplatok ? (
        <>
          <h1 className="govuk-heading-l">
            Vyplatenie daňového bonusu alebo rozdielu daňového bonusu
          </h1>
          <p data-test="ineligible-message">
            Toto sa vás netýka. Nemáte žiaden daňový bonus na vyplatenie.
          </p>
          <Link href={nextRoute()}>
            <button
              data-test="next"
              className="govuk-button govuk-!-margin-top-3"
              type="button"
            >
              Pokračovať
            </button>
          </Link>
        </>
      ) : (
        <FormWrapper<TaxBonusUserInput>
          initialValues={taxFormUserInput}
          validate={validate}
          onSubmit={(values) => {
            setTaxFormUserInput(values)
            router.push(nextRoute())
          }}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
          }: FormikProps<TaxBonusUserInput>) => (
            <>
              <ErrorSummary<TaxBonusUserInput>
                errors={errors}
                touched={touched}
              />
              <Form className="form" noValidate>
                <BooleanRadio
                  name="ziadamVratitDanovyBonusAleboPreplatok"
                  title="Žiadam o vyplatenie daňového bonusu alebo rozdielu daňového bonusu"
                />

                {values.ziadamVratitDanovyBonusAleboPreplatok && (
                  <Input
                    name="iban"
                    type="text"
                    label="IBAN"
                    hint="Účet na ktorý má byť vyplatený daňový bonus alebo rozdiel daňového bonusu musí byť vedený v banke na Slovensku pod vašim menom"
                    maxLength={29}
                    onChange={(event) => {
                      const iban = formatIban(
                        event.currentTarget.value,
                        values.iban,
                      )
                      setFieldValue('iban', iban)
                    }}
                  />
                )}

                <button data-test="next" className="govuk-button" type="submit">
                  Pokračovať
                </button>
              </Form>
            </>
          )}
        </FormWrapper>
      )}
    </>
  )
}

export default Iban

export const validate = (values: TaxBonusUserInput) => {
  const errors: Partial<FormErrors<TaxBonusUserInput>> = {}

  if (values.ziadamVratitDanovyBonusAleboPreplatok) {
    if (values.iban === '') {
      // Medzinárodné bankové číslo účtu (angl. International Bank Account Number, skr. IBAN)
      errors.iban = 'Zadajte váš IBAN'
    } else if (!validateIbanFormat(values.iban)) {
      errors.iban = 'Zadajte váš IBAN v správnom formáte'
    } else if (!validateIbanCountry(values.iban)) {
      errors.iban = 'Zadajte slovenský IBAN'
    }
  }

  return errors
}