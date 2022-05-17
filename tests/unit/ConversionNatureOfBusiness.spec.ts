import Vue from 'vue'
import Vuetify from 'vuetify'
import { getVuexStore } from '@/store/'
import { mount } from '@vue/test-utils'
import ConversionNOB from '@/components/Conversion/ConversionNOB.vue'

Vue.use(Vuetify)

const vuetify = new Vuetify({})

const businessInformation = {
  legalType: 'SP',
  identifier: '',
  legalName: '',
  foundingDate: '',
  hasRestrictions: false,
  naicsCode: '1234',
  naicsDescription: 'food'
}

const entitySnapShot = {
  businessInfo: businessInformation,
  authInfo: null,
  orgPersons: null,
  addresses: null,
  nameTranslations: null,
  shareStructure: null,
  resolutions: null
}

const initialProps = {
  onEditMode: false,
  naicsRules: [],
  naicsText: ''
}

describe('ConversionNatureOfBusiness', () => {
  let wrapperFactory: any
  let store: any = getVuexStore()

  beforeEach(() => {
    wrapperFactory = (propsData: any) => {
      return mount(ConversionNOB, {
        propsData: {
          ...propsData
        },
        store,
        vuetify
      })
    }
  })
  store.state.stateModel.businessInformation = businessInformation
  store.state.stateModel.entitySnapshot = entitySnapShot

  it('renders the naicsSummary text', async () => {
    const wrapper = wrapperFactory(initialProps)

    expect(wrapper.findComponent(ConversionNOB).exists()).toBe(true)
    expect(wrapper.find('#naics-summary').text()).toBe('1234 - food')

    wrapper.destroy()
  })

  it('renders the text field and texts', async () => {
    const wrapper = wrapperFactory(initialProps)

    wrapper.find('#nob-change-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.find('p').text()).toContain('Provide a brief description')
    expect(wrapper.find('.v-text-field label').text()).toContain('Enter Nature of Business')
    expect(wrapper.find('.v-counter').text()).toBe('11 / 300')
    expect(wrapper.vm.$data.naicsText).toBe('1234 - food')
    expect(wrapper.vm.$data.onEditMode).toBeTruthy()
    expect(wrapper.find('#naics-summary').exists()).toBeFalsy()

    wrapper.destroy()
  })

  it('simulates input text and the cancel button', async () => {
    const wrapper = wrapperFactory(initialProps)

    wrapper.find('#nob-change-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.onEditMode).toBeTruthy()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('5678 - cake')

    wrapper.find('#nob-cancel-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.naicsText).toBe('5678 - cake')
    expect(wrapper.vm.$data.onEditMode).toBeFalsy()
    expect(wrapper.find('#naics-summary').exists()).toBeTruthy()
    expect(wrapper.find('#naics-summary').text()).toBe('1234 - food')
    expect(wrapper.vm.$data.hasConversionNOBChanged).toBeFalsy()

    wrapper.destroy()
  })

  it('simulates input text and the done button', async () => {
    const updatedBusinessInfo = { ...businessInformation, naicsCode: '', naicsDescription: '5678 - cake' }
    store.state.stateModel.businessInformation = updatedBusinessInfo
    store.state.stateModel.entitySnapshot = entitySnapShot

    const wrapper = wrapperFactory(initialProps)

    wrapper.find('#nob-change-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.onEditMode).toBeTruthy()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('5678 - cake')

    wrapper.find('#nob-done-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.naicsText).toBe('5678 - cake')
    expect(wrapper.vm.$data.onEditMode).toBeFalsy()
    expect(wrapper.find('#naics-summary').exists()).toBeTruthy()
    expect(wrapper.find('#naics-summary').text()).toBe('5678 - cake')
    expect(wrapper.find('#changed-chip').exists()).toBeTruthy()

    wrapper.destroy()
  })

  it('simulates error for 0 characters length', async () => {
    store.state.stateModel.businessInformation = businessInformation
    store.state.stateModel.entitySnapshot = entitySnapShot

    const wrapper = wrapperFactory(initialProps)

    wrapper.find('#nob-change-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.onEditMode).toBeTruthy()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('')

    wrapper.find('#nob-done-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.naicsText).toBe('')
    expect(wrapper.vm.$data.onEditMode).toBeFalsy()
    expect(wrapper.find('#naics-summary').exists()).toBeTruthy()
    expect(wrapper.find('#naics-summary').text()).toBe('(Not Entered)')

    wrapper.destroy()
  })

  it('simulates error for over 300 characters length', async () => {
    const wrapper = wrapperFactory(initialProps)

    wrapper.find('#nob-change-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.onEditMode).toBeTruthy()

    const input = wrapper.find('input[type="text"]')
    const overLimit = 'FQbmUtcTEzdDUwa0JDbjF3bHF6dHN0UGdUM1dFIn0.eyJqdGkiOiIzZDQ3YjgwYy01MTAzLTRjMTYtOGNhZC0yMjU4Ns8' +
      'HAiOjE1Njg0ODk1NTksIm5iZiI6MCwiaWF0IjoxNTY4NDAzMTYwLCJpc3MiOiJodHRwczovL3Nzby1kZXYucGF0aGZpbmRlci5nb3YuYmMuY2' +
      'EvYXV0aC9yZWFsbXMvZmNmMGtwcXIiLCJhdWQiOlsic2JjLWF1dGgtd2ViIiwicmVhbG0tbWFuYWdlbWVudCIsImJyb2tlciIsImFjY291bnQ'

    await input.setValue(overLimit)

    wrapper.find('#nob-done-btn').trigger('click')
    await Vue.nextTick()

    expect(wrapper.vm.$data.naicsText).toBe(overLimit)
    expect(wrapper.vm.$data.onEditMode).toBeTruthy()
    expect(wrapper.find('.v-counter').text()).toBe('311 / 300')
    expect(wrapper.find('.v-messages').text()).toBe('Maximum 300 characters reached')
    expect(wrapper.find('#naics-summary').exists()).toBeFalsy()

    wrapper.destroy()
  })
})
