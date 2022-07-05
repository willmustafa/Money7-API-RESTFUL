const {stringToIsoDate} = require('../../utils/date-format')

class NubankCardTransaction {
	handle(transaction){
		this.transaction = transaction

		return {
			...this.getCategoria(),
			...this.getValor(),
			...this.getDate(),
			...this.getDescricao(),
			...this.getId()
		}
	}

	getCategoria(){
		return {
			categoria: this.transaction.title.toLowerCase()
		}
	}

	getValor(){
		return {
			valor: -1*Number.parseInt(this.transaction.amount)/100
		}
	}

	getId(){
		return {
			id: this.transaction.id
		}
	}

	getDescricao(){
		let descricao = this.transaction.description.toLowerCase()

		return {
			descricao
		}
	}

	getDate(){
		return {
			date: stringToIsoDate(this.transaction.time)
		}
	}
}

class NubankAccountTransaction {
	handle(transaction){
		this.transaction = transaction

		this.billTypes = [
			'TransferOutEvent',
			'BarcodePaymentEvent',
			'DebitPurchaseEvent',
			'GenericFeedEvent',
			'BillPaymentEvent',
			'AddToReserveEvent'
		]

		this.incomeTypes = [
			'TransferInEvent',
			'RemoveFromReserveEvent',
			'LockMoneySuccessEvent',
			'TransferOutReversalEvent'
		]

		return {
			...this.getId(),
			...this.getCategoria(),
			...this.getDate(),
			...this.getDescricao(),
			...this.getValor()
		}
	}

	ignoreTypes(){
		return [
			'WelcomeEvent',
			'welcome',
			'customer_invitations_changed',
			'tutorial',
			'initial_account_limit',
			'card_activated',
			'payment',
			'account_limit_set',
			'bill_flow_paid',
			'customer_device_authorized',
			'customer_password_changed',
			'transaction_reversed',
			'bill_flow_closed',
			'anticipate_event',
		]
	}

	getId(){
		return {
			id: this.transaction.id
		}
	}

	getDescricao(){
		let descricao = ''
		const originAccount_name = this.transaction.originAccount ? this.transaction.originAccount.name : ''

		if(this.transaction.__typename == 'DebitPurchaseEvent') descricao = this.transaction.detail.split(' - R$')[0]
		if(this.transaction.__typename == 'TransferInEvent') descricao = this.transaction.title + ' - ' + originAccount_name
		if(this.transaction.__typename == 'GenericFeedEvent') descricao = this.transaction.title + ' - ' + this.transaction.detail.split('\n')[0]
		if(this.transaction.__typename == 'RemoveFromReserveEvent') descricao = this.transaction.title
		if(this.transaction.__typename == 'PhoneRechargeSuccessEvent') descricao = this.transaction.title + ' - ' + this.transaction.detail
		if(this.transaction.__typename == 'TransferOutEvent') descricao = this.transaction.title + ' - ' + this.transaction.detail.split(' - R$')[0]
		if(this.transaction.__typename == 'BarcodePaymentEvent') descricao = this.transaction.title + ' - ' + this.transaction.detail
		if(this.transaction.__typename == 'BillPaymentEvent') descricao = this.transaction.title + ' - ' + this.transaction.detail.split(' - R$')[0]
		if(this.transaction.__typename == 'AddToReserveEvent') descricao = this.transaction.title
		if(this.transaction.__typename == 'TransferOutReversalEvent') descricao = this.transaction.title + ' - ' + this.transaction.detail.split(' - R$')[0]
		if(this.transaction.__typename == 'LockMoneySuccessEvent') descricao = this.transaction.title

		return {
			descricao
		}
	}

	getDate(){
		let date = this.transaction.postDate ? this.transaction.postDate : this.transaction.time

		return {
			date: stringToIsoDate(date)
		}
	}

	getValor(){
		let valor = ''

		if(this.transaction.__typename == 'GenericFeedEvent'){
			const split = this.transaction.detail.split('\n')

			if(split.length > 1){
				valor = this.transaction.detail.split('\nR$ ')[1].replace('.', '').replace(',', '.')
			} else{
				valor = this.transaction.detail.replace('R$', '').replace('.', '').replace(',', '.')
			}
		} 
		if(this.transaction.__typename == 'RemoveFromReserveEvent') valor = this.transaction.detail.replace('R$ ', '').replace('.', '').replace(',', '.')
		if(this.transaction.__typename == 'DebitPurchaseEvent') valor = this.transaction.amount
		if(this.transaction.__typename == 'TransferInEvent') valor = this.transaction.amount
		if(this.transaction.__typename == 'PhoneRechargeSuccessEvent') valor = 0
		if(this.transaction.__typename == 'TransferOutEvent') valor = this.transaction.amount
		if(this.transaction.__typename == 'BarcodePaymentEvent') valor = this.transaction.amount
		if(this.transaction.__typename == 'BillPaymentEvent') valor = this.transaction.amount 
		if(this.transaction.__typename == 'AddToReserveEvent') valor = this.transaction.detail.replace('R$ ', '').replace('.', '').replace(',', '.')
		if(this.transaction.__typename == 'TransferOutReversalEvent') valor = this.transaction.amount
		if(this.transaction.__typename == 'LockMoneySuccessEvent') valor = this.transaction.detail.replace('R$ ', '').replace('.', '').replace(',', '.')

		const negative = this.billTypes.includes(this.transaction.__typename) ? -1 : 1
		return {
			valor: isNaN(Number.parseFloat(valor)) ? 0 : Number.parseFloat(valor)*negative
		}
	}

	getCategoria(){
		return {
			categoria: this.transaction.title.toLowerCase()
		}
	}
}

module.exports = {
	NubankAccountTransaction,
	NubankCardTransaction
}