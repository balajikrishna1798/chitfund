# Generated by Django 4.2 on 2023-05-17 18:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('kyc', '0002_kyc_slug'),
        ('deposit', '0006_alter_deposit_deposited_on_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='deposit',
            name='kyc',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='deposit', to='kyc.kyc'),
        ),
    ]
