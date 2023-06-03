# Generated by Django 4.2 on 2023-05-16 05:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deposit', '0004_remove_deposit_withdrawn_on_deposit_maturity_term'),
    ]

    operations = [
        migrations.AlterField(
            model_name='deposit',
            name='deposited_on',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='deposit',
            name='maturity_term',
            field=models.DateField(blank=True, null=True),
        ),
    ]
